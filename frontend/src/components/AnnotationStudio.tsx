'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Upload, ChevronLeft, ChevronRight, Trash2, Save, Image as ImageIcon, Info, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Stage, Layer, Line, Circle } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface PolygonPoint {
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
}

type Polygon = PolygonPoint[];

interface AnnotatedImage {
  id: number;
  title: string;
  image: string;
  polygons: Polygon[];
}

export const AnnotationStudio: React.FC = () => {
  const [images, setImages] = useState<AnnotatedImage[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Drawing states
  const [currentPoints, setCurrentPoints] = useState<PolygonPoint[]>([]);
  const [mousePos, setMousePos] = useState<PolygonPoint | null>(null);
  const [selectedPolygonIdx, setSelectedPolygonIdx] = useState<number | null>(null);
  const [hoveredPolygonIdx, setHoveredPolygonIdx] = useState<number | null>(null);

  // Resize handling for react-konva
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isMounted, setIsMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const activeImage = activeIndex >= 0 && activeIndex < images.length ? images[activeIndex] : null;

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setCanvasSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [activeImage]);

  // Fetch existing images from backend on load
  const fetchImages = async () => {
    setIsLoading(true);
    const token = useAuthStore.getState().token;
    try {
      const response = await fetch(`${API_URL}/api/annotated-images/`, {
        headers: {
          'Authorization': token ? `Token ${token}` : '',
        }
      });
      if (response.ok) {
        const data: AnnotatedImage[] = await response.json();
        setImages(data);
        if (data.length > 0) {
          setActiveIndex(0);
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error fetching images:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchImages();
    }
  }, [token]);

  if (!isMounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-slate-400">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-slate-400">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
      </div>
    );
  }

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setIsLoading(true);

    const filesArray = Array.from(e.target.files);
    for (const file of filesArray) {
      const formData = new FormData();
      formData.append('title', file.name.split('.')[0] || 'Uploaded Image');
      formData.append('image', file);
      formData.append('polygons', JSON.stringify([]));

      const token = useAuthStore.getState().token;
      try {
        const response = await fetch(`${API_URL}/api/annotated-images/`, {
          method: 'POST',
          headers: {
            'Authorization': token ? `Token ${token}` : '',
          },
          body: formData,
        });

        if (response.ok) {
          const newImg: AnnotatedImage = await response.json();
          setImages((prev) => {
            const updated = [...prev, newImg];
            if (activeIndex === -1) {
              setActiveIndex(0);
            }
            return updated;
          });
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Upload failed:', error);
        }
      }
    }
    
    setIsLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = async (id: number) => {
    const token = useAuthStore.getState().token;
    try {
      const response = await fetch(`${API_URL}/api/annotated-images/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Token ${token}` : '',
        },
      });
      if (response.ok) {
        setImages((prev) => {
          const filtered = prev.filter((img) => img.id !== id);
          if (activeImage?.id === id) {
            setActiveIndex(filtered.length > 0 ? 0 : -1);
            cancelDrawing();
            setSelectedPolygonIdx(null);
          } else {
            const deletedIdx = prev.findIndex((img) => img.id === id);
            if (deletedIdx !== -1 && deletedIdx < activeIndex) {
              setActiveIndex(activeIndex - 1);
            }
          }
          return filtered;
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to delete image:', error);
      }
    }
  };

  // Convert pixel coordinates to percentages
  const getPercentageCoords = (x: number, y: number): PolygonPoint => {
    return {
      x: (x / canvasSize.width) * 100,
      y: (y / canvasSize.height) * 100,
    };
  };

  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    if (!activeImage) return;

    // If clicking on a shape, select it (unless we're drawing)
    if (currentPoints.length === 0 && e.target.name() === 'polygon') {
      const idxStr = e.target.id();
      setSelectedPolygonIdx(parseInt(idxStr, 10));
      return;
    }

    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return;

    const coords = getPercentageCoords(pos.x, pos.y);

    if (currentPoints.length > 0) {
      setCurrentPoints((prev) => [...prev, coords]);
    } else {
      setSelectedPolygonIdx(null);
      setCurrentPoints([coords]);
    }
  };

  const handleStageMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (currentPoints.length === 0) return;
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return;
    setMousePos(getPercentageCoords(pos.x, pos.y));
  };

  const closePolygon = () => {
    if (currentPoints.length < 3 || !activeImage) return;
    const updatedPolygons = [...activeImage.polygons, currentPoints];
    updateLocalPolygons(updatedPolygons);
    setCurrentPoints([]);
    setMousePos(null);
  };

  const cancelDrawing = () => {
    setCurrentPoints([]);
    setMousePos(null);
  };

  const deleteSelectedPolygon = () => {
    if (!activeImage || selectedPolygonIdx === null) return;
    const updated = activeImage.polygons.filter((_, idx) => idx !== selectedPolygonIdx);
    updateLocalPolygons(updated);
    setSelectedPolygonIdx(null);
  };

  const updateLocalPolygons = (updatedPolygons: Polygon[]) => {
    if (!activeImage) return;
    const updatedImages = images.map((img, idx) =>
      idx === activeIndex ? { ...img, polygons: updatedPolygons } : img
    );
    setImages(updatedImages);
  };

  const handleSaveAnnotations = async () => {
    if (!activeImage) return;
    setIsSaving(true);
    const token = useAuthStore.getState().token;

    try {
      const response = await fetch(`${API_URL}/api/annotated-images/${activeImage.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Token ${token}` : '',
        },
        body: JSON.stringify({
          polygons: activeImage.polygons,
        }),
      });

      if (response.ok) {
        alert('Annotations saved successfully!');
      } else {
        alert('Failed to save annotations.');
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(error);
      }
      alert('Error updating annotations on server.');
    } finally {
      setIsSaving(false);
    }
  };

  const ptToPx = (pct: number, max: number) => (pct / 100) * max;

  const getImageUrl = (url?: string | null): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('/')) {
      return `${API_URL}${url}`;
    }
    return url;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-140px)] min-h-[600px]">
      
      {/* LEFT SIDEBAR */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4 bg-white/5 border border-white/10 backdrop-blur-md p-5 rounded-3xl h-full overflow-hidden shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100">Image Library</h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {images.length} Images
          </span>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center border border-dashed border-white/20 hover:border-indigo-500/50 hover:bg-indigo-500/5 rounded-2xl p-6 transition duration-200 cursor-pointer text-slate-400 hover:text-white"
        >
          <Upload className="w-6 h-6 mb-2 text-indigo-400" />
          <span className="text-sm font-semibold">Upload Images</span>
          <span className="text-xs text-slate-500 mt-1">PNG, JPG, JPEG</span>
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} multiple accept="image/*" className="hidden" />
        </button>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1">
          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500">
              <ImageIcon className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">No images uploaded</p>
            </div>
          ) : (
            images.map((img, idx) => (
              <div
                key={img.id}
                onClick={() => {
                  cancelDrawing();
                  setSelectedPolygonIdx(null);
                  setActiveIndex(idx);
                }}
                className={`group flex items-center gap-3 p-2.5 rounded-2xl border cursor-pointer transition relative ${
                  idx === activeIndex
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/15'
                }`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteImage(img.id);
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/50 hover:bg-rose-500/80 text-slate-300 hover:text-white transition opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
                  {getImageUrl(img.image) ? (
                    <img src={getImageUrl(img.image)} alt={img.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-slate-500 font-medium">No Img</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-200 truncate group-hover:text-white transition">
                    {img.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {img.polygons.length} polygon{img.polygons.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CENTER WORKSPACE */}
      <div className="flex-1 flex flex-col gap-4 bg-slate-950/20 border border-white/10 backdrop-blur-md p-6 rounded-3xl h-full shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-center border-b border-white/5 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-100">
              {activeImage ? activeImage.title : 'Workspace'}
            </h2>
            {activeImage && (
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                Active
              </span>
            )}
          </div>
          {activeImage && (
            <div className="flex items-center gap-2">
              <button
                disabled={activeIndex <= 0}
                onClick={() => {
                  cancelDrawing();
                  setSelectedPolygonIdx(null);
                  setActiveIndex((prev) => prev - 1);
                }}
                className="p-2 hover:bg-white/5 rounded-xl border border-white/5 disabled:opacity-30 transition text-slate-400 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-400 font-semibold">{activeIndex + 1} / {images.length}</span>
              <button
                disabled={activeIndex >= images.length - 1}
                onClick={() => {
                  cancelDrawing();
                  setSelectedPolygonIdx(null);
                  setActiveIndex((prev) => prev + 1);
                }}
                className="p-2 hover:bg-white/5 rounded-xl border border-white/5 disabled:opacity-30 transition text-slate-400 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-black/60 rounded-2xl border border-white/5">
          {isLoading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
            </div>
          ) : !activeImage ? (
            <div className="flex flex-col items-center text-center p-8 text-slate-500">
              <ImageIcon className="w-16 h-16 mb-4 stroke-1" />
              <h3 className="text-lg font-bold text-slate-300">No Image Selected</h3>
            </div>
          ) : (
            <div
              ref={containerRef}
              className="relative max-w-full max-h-full aspect-auto select-none overflow-hidden"
              style={{ display: 'inline-block' }}
            >
              <img
                src={getImageUrl(activeImage.image)}
                alt="Annotation Target"
                className="max-h-[500px] w-auto max-w-full object-contain pointer-events-none"
              />

              {isMounted && canvasSize.width > 0 && canvasSize.height > 0 && (
                <div className="absolute inset-0 cursor-crosshair">
                  <Stage
                    width={canvasSize.width}
                    height={canvasSize.height}
                    onClick={handleStageClick}
                    onMouseMove={handleStageMouseMove}
                    onDblClick={() => {
                      if (currentPoints.length >= 3) closePolygon();
                    }}
                    onDblTap={() => {
                      if (currentPoints.length >= 3) closePolygon();
                    }}
                  >
                    <Layer>
                      {/* Render closed polygons and their vertices */}
                      {activeImage.polygons.map((poly, idx) => {
                        const flatPoints = poly.flatMap((pt) => [
                          ptToPx(pt.x, canvasSize.width),
                          ptToPx(pt.y, canvasSize.height),
                        ]);
                        const isSelected = idx === selectedPolygonIdx;
                        const isHovered = idx === hoveredPolygonIdx;
                        const isHighlighted = isSelected || isHovered;
                        
                        return (
                          <React.Fragment key={idx}>
                            <Line
                              id={idx.toString()}
                              name="polygon"
                              points={flatPoints}
                              closed
                              fill={isHighlighted ? 'rgba(245,158,11,0.2)' : 'rgba(167, 139, 250, 0.18)'}
                              stroke={isHighlighted ? '#fbbf24' : '#a78bfa'}
                              strokeWidth={isHighlighted ? 2.5 : 2}
                              onMouseEnter={(e) => {
                                const container = e.target.getStage()?.container();
                                if (container) container.style.cursor = 'pointer';
                                setHoveredPolygonIdx(idx);
                              }}
                              onMouseLeave={(e) => {
                                const container = e.target.getStage()?.container();
                                if (container) container.style.cursor = 'crosshair';
                                setHoveredPolygonIdx(null);
                              }}
                            />
                            {/* Visible Perimeter Vertices */}
                            {poly.map((pt, ptIdx) => (
                              <Circle
                                key={`poly-${idx}-pt-${ptIdx}`}
                                x={ptToPx(pt.x, canvasSize.width)}
                                y={ptToPx(pt.y, canvasSize.height)}
                                radius={isHighlighted ? 4.5 : 3.5}
                                fill={isHighlighted ? '#fbbf24' : '#ffffff'}
                                stroke={isHighlighted ? '#fbbf24' : '#8b5cf6'}
                                strokeWidth={1.5}
                                listening={false}
                                shadowColor={isHighlighted ? '#fbbf24' : 'transparent'}
                                shadowBlur={isHighlighted ? 6 : 0}
                                shadowOpacity={isHighlighted ? 0.8 : 0}
                              />
                            ))}
                          </React.Fragment>
                        );
                      })}

                      {/* Render active polygon drawing */}
                      {currentPoints.length > 0 && (
                        <Line
                          points={
                            currentPoints.flatMap((pt) => [
                              ptToPx(pt.x, canvasSize.width),
                              ptToPx(pt.y, canvasSize.height),
                            ]).concat(
                              mousePos && typeof mousePos.x === 'number' && !isNaN(mousePos.x) && typeof mousePos.y === 'number' && !isNaN(mousePos.y) ? [ptToPx(mousePos.x, canvasSize.width), ptToPx(mousePos.y, canvasSize.height)] : []
                            )
                          }
                          stroke="#818cf8"
                          strokeWidth={2}
                          dash={[4, 4]}
                          listening={false}
                          perfectDrawEnabled={false}
                        />
                      )}

                      {/* Render first point to close (only if drawing) */}
                      {currentPoints.length > 0 && (
                        <Circle
                          name="first-point"
                          x={ptToPx(currentPoints[0].x, canvasSize.width)}
                          y={ptToPx(currentPoints[0].y, canvasSize.height)}
                          radius={6}
                          hitStrokeWidth={20}
                          strokeScaleEnabled={false}
                          fill="#ec4899"
                          stroke="white"
                          strokeWidth={2}
                          onClick={(e) => {
                            e.evt.stopPropagation();
                            e.cancelBubble = true;
                            if (currentPoints.length >= 3) {
                              closePolygon();
                            }
                          }}
                          onTap={(e) => {
                            e.evt.stopPropagation();
                            e.cancelBubble = true;
                            if (currentPoints.length >= 3) {
                              closePolygon();
                            }
                          }}
                          onMouseEnter={(e) => {
                            e.target.scale({ x: 1.25, y: 1.25 });
                            const container = e.target.getStage()?.container();
                            if (container) container.style.cursor = 'pointer';
                          }}
                          onMouseLeave={(e) => {
                            e.target.scale({ x: 1, y: 1 });
                            const container = e.target.getStage()?.container();
                            if (container) container.style.cursor = 'crosshair';
                          }}
                        />
                      )}

                      {/* Render vertices of active drawing */}
                      {currentPoints.map((pt, idx) => (
                        <Circle
                          key={`active-vert-${idx}`}
                          x={ptToPx(pt.x, canvasSize.width)}
                          y={ptToPx(pt.y, canvasSize.height)}
                          radius={4}
                          fill="#818cf8"
                          stroke="#0f172a"
                          strokeWidth={1}
                        />
                      ))}
                    </Layer>
                  </Stage>
                </div>
              )}
            </div>
          )}
        </div>

        {activeImage && (
          <div className="flex justify-between items-center border-t border-white/5 pt-4 shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Info className="w-4 h-4 text-indigo-400" />
              <span>
                {currentPoints.length > 0
                  ? `Placing vertices (${currentPoints.length}). Click the first dot to close the shape.`
                  : 'Click on the image to drop points. Select vertices to highlight shapes.'}
              </span>
            </div>
            {currentPoints.length > 0 && (
              <button onClick={cancelDrawing} className="text-xs text-rose-400 hover:underline">Cancel</button>
            )}
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4 bg-white/5 border border-white/10 backdrop-blur-md p-5 rounded-3xl h-full shadow-xl">
        <h3 className="text-lg font-bold text-slate-100">Shape Manager</h3>
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
          {activeImage ? (
            activeImage.polygons.length === 0 ? (
              <div className="text-center py-20 text-slate-500 text-sm font-medium">No shapes annotated yet</div>
            ) : (
              activeImage.polygons.map((poly, idx) => {
                const isSelected = idx === selectedPolygonIdx;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedPolygonIdx(idx)}
                    onMouseEnter={() => setHoveredPolygonIdx(idx)}
                    onMouseLeave={() => setHoveredPolygonIdx(null)}
                    className={`flex justify-between items-center p-3 rounded-2xl border cursor-pointer transition-colors ${
                      isSelected ? 'border-amber-500 bg-amber-500/10' : 'border-white/5 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xs font-semibold text-slate-300">Shape #{idx + 1} ({poly.length} pts)</span>
                    {isSelected && (
                      <button onClick={(e) => { e.stopPropagation(); deleteSelectedPolygon(); }} className="text-rose-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )
          ) : (
            <div className="text-center py-16 text-slate-600 text-sm">Select an image</div>
          )}
        </div>
        {activeImage && (
          <button
            onClick={handleSaveAnnotations}
            disabled={isSaving}
            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3.5 rounded-2xl disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Annotations
          </button>
        )}
      </div>
    </div>
  );
};

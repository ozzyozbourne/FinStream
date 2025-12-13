import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import LiveChart from "../../components/ui/LiveChart/LiveChart";
import Button from "../../components/ui/Button"; // Reusing existing Button component
import "./ResearchPage.css";

const defaultSymbols = ["AAPL", "TSLA", "MSFT", "NVDA", "GOOGL", "AMZN"];

interface SortableChartItemProps {
  symbol: string;
  onRemove: (symbol: string) => void;
  viewMode: "list" | "grid";
}

const SortableChartItem: React.FC<SortableChartItemProps> = ({
  symbol,
  onRemove,
  viewMode,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: symbol });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`chart-item-wrapper ${viewMode}`}
    >
      {/* Drag Handle overlaid or integrated */}
      <div className="chart-drag-handle" {...attributes} {...listeners}>
        ⋮⋮
      </div>
      <LiveChart symbol={symbol} onRemove={onRemove} />
    </div>
  );
};

const ResearchPage = () => {
  const [symbols, setSymbols] = useState<string[]>(() => {
    const saved = localStorage.getItem("research_symbols");
    return saved ? JSON.parse(saved) : defaultSymbols;
  });
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid"); // Defaulting to grid as requested "add grid format" and it's popular

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Save to localStorage whenever symbols change
  React.useEffect(() => {
    localStorage.setItem("research_symbols", JSON.stringify(symbols));
  }, [symbols]);

  const handleAddSymbol = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search) return;

    const upper = search.toUpperCase().trim();
    if (!upper) return;

    // Add new symbol to TOP
    if (!symbols.includes(upper)) {
      setSymbols([upper, ...symbols]);
    }

    setSearch("");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSymbols((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="research-live-container">
      <div className="research-header-container">
        <div className="header-left-section">
          <div className="title-block">
            <h1 className="research-title">Live Market Data</h1>
          </div>

          {/* Search Bar */}
          <form className="symbol-search-container" onSubmit={handleAddSymbol}>
            <input
              type="text"
              value={search}
              placeholder="Enter symbol..."
              onChange={(e) => setSearch(e.target.value)}
              className="symbol-input"
            />
            <button type="submit" className="symbol-add-btn">
              Add
            </button>
          </form>
        </div>

        {/* View Toggle */}
        <div className="view-toggle-container">
          <Button
            variant={viewMode === "list" ? "primary" : "outline"}
            size="small"
            onClick={() => setViewMode("list")}
          >
            List
          </Button>
          <Button
            variant={viewMode === "grid" ? "primary" : "outline"}
            size="small"
            onClick={() => setViewMode("grid")}
          >
            Grid
          </Button>
        </div>
      </div>

      {/* Chart Grid/List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={symbols} strategy={rectSortingStrategy}>
          <div className={`research-charts-grid ${viewMode}`}>
            {symbols.map((sym) => (
              <SortableChartItem
                key={sym}
                symbol={sym}
                onRemove={(symbol) =>
                  setSymbols(symbols.filter((s) => s !== symbol))
                }
                viewMode={viewMode}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default ResearchPage;

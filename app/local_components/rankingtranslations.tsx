import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useState, useCallback } from "react";
import { GripVertical } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  MeasuringStrategy,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

type Translation = {
  id: string;
  sourceText: string;
  targetText: string;
  candidates: string[];
};

type Props = {
  user: { 
    id: string; 
    email: string 
  };
  translation: Translation;
};

type RankingItem = {
  type: string;
  text: string;
  rank: number;
};

function SortableItem({ item }: { item: RankingItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isItemDragging,
  } = useSortable({
    id: item.type,
    data: item,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isItemDragging ? 1 : 0,
    opacity: isItemDragging ? 0.5 : 1,
    position: 'relative' as const,
    touchAction: 'manipulation',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-start gap-3 p-4 bg-white rounded-lg border 
                 border-gray-200 hover:border-gray-300 cursor-move touch-manipulation 
                 select-none ${isItemDragging ? 'shadow-lg' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center h-full text-gray-400 group-hover:text-gray-600">
        <GripVertical size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full 
                         text-sm font-medium bg-blue-100 text-blue-800">
            Rank {item.rank}
          </span>
        </div>
        <div className="text-gray-700 whitespace-pre-wrap break-words">
          {item.text}
        </div>
      </div>
    </div>
  );
}

export default function RankingTranslation({ user, translation }: Props) {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [isDragging, setIsDragging] = useState(false);

  const initializeRankings = useCallback(() => 
    translation.candidates.map((text, index) => ({
      type: `${index}`,
      text,
      rank: index + 1
    })), [translation.candidates]);

  const [rankingItems, setRankingItems] = useState<RankingItem[]>(initializeRankings);

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 0,
        tolerance: 5,
        distance: 0,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    console.log('Drag started:', event);
    setIsDragging(true);
    const { active } = event;
    console.log('Active element:', active);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    console.log('Drag ended:', event);
    setIsDragging(false);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setRankingItems((items) => {
        const oldIndex = items.findIndex((item) => item.type === active.id);
        const newIndex = items.findIndex((item) => item.type === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item, index) => ({
          ...item,
          rank: index + 1,
        }));
      });
    }
  };

  const handleReset = () => {
    setRankingItems(initializeRankings());
  };
  
  return (
    <div className="min-h-screen py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-white">
          <CardContent className="p-6 sm:p-8 lg:p-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">
              MT Evaluation
            </h1>

            <div className="space-y-6 mb-8">
              <div>
                <h2 className="text-base font-semibold text-gray-800 mb-3">
                  Source Text
                </h2>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-gray-700">
                  {translation.sourceText}
                </div>
              </div>

              <div>
                <h2 className="text-base font-semibold text-gray-800 mb-3">
                  Target Text
                </h2>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-gray-700">
                  {translation.targetText}
                </div>
              </div>
            </div>

            <Form
              method="post"
              action={`/rankingAction?session=${user.email}`}
              className="space-y-6"
            >
              <input
                type="hidden"
                name="translationId"
                value={translation.id}
              />
              <input type="hidden" name="userId" value={user.id} />
              <input
                type="hidden"
                name="rankings"
                value={JSON.stringify(rankingItems.map(item => item.text))}
              />

              {actionData?.errors?.form && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">
                    {actionData.errors.form}
                  </p>
                </div>
              )}

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Rank the translations
                </h2>
                <DndContext
                  id={`dnd-context-${translation.id}`}
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToVerticalAxis]}
                  measuring={{
                    droppable: { strategy: MeasuringStrategy.Always },
                  }}
                >
                  <SortableContext
                    items={rankingItems.map((item) => item.type)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {rankingItems.map((item) => (
                        <SortableItem key={item.type} item={item} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-fit mx-auto sm:mx-0 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:bg-white active:bg-white"
                >
                  Reset Order
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-fit mx-auto sm:mx-0 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Submit Ranking"}
                </button>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
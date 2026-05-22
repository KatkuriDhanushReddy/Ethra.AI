import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Calendar, User } from 'lucide-react';
import { tasksAPI } from '../services/api';
import { formatDate, priorityColors } from '../utils/helpers';
import toast from 'react-hot-toast';

const columns = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'completed', title: 'Completed' },
];

export default function KanbanBoard({ tasks, onUpdate, canDrag = true }) {
  const grouped = columns.reduce((acc, col) => {
    acc[col.id] = tasks.filter((t) => t.status === col.id);
    return acc;
  }, {});

  const onDragEnd = async (result) => {
    if (!canDrag || !result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    const task = tasks.find((t) => t._id === draggableId);
    if (!task || task.status === newStatus) return;

    try {
      const { data } = await tasksAPI.reorder(draggableId, newStatus);
      onUpdate(data.data);
      toast.success('Task moved');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map((col) => (
          <div key={col.id} className="card flex flex-col">
            <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <h3 className="font-semibold text-sm">
                {col.title}
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">
                  {grouped[col.id]?.length || 0}
                </span>
              </h3>
            </div>
            <Droppable droppableId={col.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-1 space-y-3 p-3 min-h-[200px]"
                >
                  {grouped[col.id]?.map((task, index) => (
                    <Draggable
                      key={task._id}
                      draggableId={task._id}
                      index={index}
                      isDragDisabled={!canDrag}
                    >
                      {(prov, snapshot) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition dark:border-slate-700 dark:bg-slate-800 ${
                            snapshot.isDragging ? 'shadow-lg ring-2 ring-brand-500/30' : ''
                          }`}
                        >
                          <p className="font-medium text-sm">{task.title}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span
                              className={`rounded-lg px-2 py-0.5 text-xs font-medium capitalize ${priorityColors[task.priority]}`}
                            >
                              {task.priority}
                            </span>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                            {task.assignedTo && (
                              <span className="flex items-center gap-1">
                                <User size={12} />
                                {task.assignedTo.name}
                              </span>
                            )}
                            {task.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {formatDate(task.dueDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}

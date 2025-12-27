import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';

const columnsBackendStructure = {
  New: { name: "New Requests", items: [] },
  "In Progress": { name: "In Progress", items: [] },
  Repaired: { name: "Repaired", items: [] },
  Scrap: { name: "Scrap", items: [] }
};

function KanbanBoard() {
  const [columns, setColumns] = useState(columnsBackendStructure);

  // 1. Fetch Data
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/requests/');
      const requests = response.data;
      
      const newColumns = { 
        New: { name: "New Requests", items: [] },
        "In Progress": { name: "In Progress", items: [] },
        Repaired: { name: "Repaired", items: [] },
        Scrap: { name: "Scrap", items: [] }
      };

      requests.forEach(req => {
          if (newColumns[req.status]) {
              newColumns[req.status].items.push(req);
          }
      });
      setColumns(newColumns);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  // 2. Handle Drag & Drop
  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      // Optimistic Update (Update UI immediately)
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      
      // Update the status of the moved item locally
      removed.status = destination.droppableId; 
      destItems.splice(destination.index, 0, removed);

      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceColumn, items: sourceItems },
        [destination.droppableId]: { ...destColumn, items: destItems }
      });

      // Send Update to Backend
      try {
        await axios.put(`http://127.0.0.1:8000/requests/${draggableId}`, {
          status: destination.droppableId
        });
        console.log("Saved to database!");
      } catch (error) {
        console.error("Failed to save:", error);
        alert("Failed to save change to server!");
        fetchRequests(); // Revert changes if server fails
      }
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
      <DragDropContext onDragEnd={onDragEnd}>
        {Object.entries(columns).map(([columnId, column]) => {
          return (
            <div key={columnId} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <h3 style={{ textTransform: 'uppercase', color: '#555' }}>{column.name}</h3>
              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{
                      background: snapshot.isDraggingOver ? "#e3f2fd" : "#f4f5f7",
                      padding: 10,
                      width: 260,
                      minHeight: 500,
                      borderRadius: "8px"
                    }}
                  >
                    {column.items.map((item, index) => (
                      <Draggable key={item.id.toString()} draggableId={item.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              userSelect: "none",
                              padding: 16,
                              margin: "0 0 10px 0",
                              minHeight: "80px",
                              backgroundColor: snapshot.isDragging ? "#fff" : "#fff",
                              color: "#333",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                              borderRadius: "4px",
                              ...provided.draggableProps.style
                            }}
                          >
                            <div style={{ fontWeight: 'bold' }}>{item.subject}</div>
                            <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                              ID: {item.id} | {item.request_type}
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
          );
        })}
      </DragDropContext>
    </div>
  );
}

export default KanbanBoard;
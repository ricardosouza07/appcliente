'use client';

import React, { useEffect, useState } from 'react';
import ClienteCard from '@/components/ClienteCard';

const COLUMNS = [
  { id: 'OPORTUNIDADE', title: 'Oportunidades', color: 'bg-orange-100' },
  { id: 'CONTATO_INICIAL', title: 'Contato Inicial', color: 'bg-blue-100' },
  { id: 'EM_NEGOCIACAO', title: 'Em Negociação', color: 'bg-purple-100' },
  { id: 'ATIVADO', title: 'Ativados (Ganhos)', color: 'bg-green-100' },
  { id: 'PERDIDO', title: 'Perdidos', color: 'bg-red-100' }
];

export default function PipelinePage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/clientes')
      .then(res => res.json())
      .then(data => {
        setClientes(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const handleMove = async (id: string, newStatus: string) => {
    setClientes(prev => prev.map(c => c.id === id ? { ...c, pipelineStatus: newStatus } : c));
    await fetch('/api/clientes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, pipelineStatus: newStatus })
    });
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('clientId', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, statusId: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('clientId');
    if (id) {
      handleMove(id, statusId);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pipeline de Reativação</h1>
        <p className="text-gray-500">Arraste os cartões para atualizar o status do cliente</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">Carregando carteira de clientes...</div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-140px)]">
          {COLUMNS.map(col => {
            const colClients = clientes.filter(c => c.pipelineStatus === col.id);
            return (
              <div 
                key={col.id} 
                className={`flex-shrink-0 w-80 rounded-xl ${col.color} border border-gray-200 flex flex-col`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <div className="p-4 border-b border-gray-200/50 flex justify-between items-center bg-white/40 rounded-t-xl">
                  <h3 className="font-semibold text-gray-700">{col.title}</h3>
                  <span className="bg-white px-2.5 py-0.5 rounded-full text-xs font-bold text-gray-600 shadow-sm">
                    {colClients.length}
                  </span>
                </div>
                <div className="p-3 flex-1 overflow-y-auto ui-kanban-col">
                  {colClients.map(cliente => (
                    <div 
                      key={cliente.id} 
                      draggable 
                      onDragStart={(e) => handleDragStart(e, cliente.id)}
                    >
                      <ClienteCard cliente={cliente} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

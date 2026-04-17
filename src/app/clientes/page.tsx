'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

export default function DashboardClientes() {
  const [stats, setStats] = useState({ total: 0, ativos: 0, risco: 0, inativos: 0, valorRecuperar: 0 });
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/clientes')
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        let ativos = 0;
        let risco = 0;
        let inativos = 0;
        let valor = 0;

        data.forEach(c => {
          if (c.pipelineStatus === 'ATIVADO') ativos++;
          else if (c.pipelineStatus === 'PERDIDO') inativos++;
          else {
            risco++;
            valor += Number(c.valorUltimoPedido || 0);
          }
        });

        setStats({ total: data.length, ativos, risco, inativos, valorRecuperar: valor });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleFileChange = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setLoading(true);
      const res = await fetch('/api/clientes/import', { method: 'POST', body: formData });
      const result = await res.json();
      alert(result.message || result.error);
      window.location.reload();
    } catch (err) {
      alert('Erro ao importar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} id="file-upload-input" />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Estratégia Reativa Fenié</h1>
          <p className="text-gray-500 mt-1">Acompanhamento e organização da carteira de clientes</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
          >
            Importar Planilha
          </button>
          <Link 
            href="/clientes/pipeline" 
            className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2"
          >
            Abrir Pipeline
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <h3 className="text-gray-500 font-medium text-sm">Total na Carteira</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? '...' : stats.total}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-2xl shadow-sm border border-green-100 flex flex-col justify-between">
          <h3 className="text-green-700 font-medium text-sm">Clientes Ativados</h3>
          <p className="text-3xl font-bold text-green-900 mt-2">{loading ? '...' : stats.ativos}</p>
        </div>
        <div className="bg-orange-50 p-6 rounded-2xl shadow-sm border border-orange-100 flex flex-col justify-between">
          <h3 className="text-orange-700 font-medium text-sm">Oportunidades (em Risco)</h3>
          <p className="text-3xl font-bold text-orange-900 mt-2">{loading ? '...' : stats.risco}</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-2xl shadow-sm border border-purple-100 flex flex-col justify-between">
          <h3 className="text-purple-700 font-medium text-sm">Valor em Risco (Estimado)</h3>
          <p className="text-3xl font-bold text-purple-900 mt-2">
            {loading ? '...' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.valorRecuperar)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Como funciona a Estratégia</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">1</div>
            <div>
              <h4 className="font-semibold text-gray-800">Importação Automática</h4>
              <p className="text-gray-600 text-sm mt-1">Ao enviar a planilha, o sistema avalia o ciclo médio de compra e os dias sem comprar. Quem ultrapassou o tempo vira Oportunidade.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">2</div>
            <div>
              <h4 className="font-semibold text-gray-800">Contato Ativo (Zap)</h4>
              <p className="text-gray-600 text-sm mt-1">Acesse o pipeline, encontre as Oportunidades e clique em "Zap". O sistema já vai abrir o WhatsApp Web preenchido com uma mensagem de retorno Fenié.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">3</div>
            <div>
              <h4 className="font-semibold text-gray-800">Gestão Visual do Kanban</h4>
              <p className="text-gray-600 text-sm mt-1">Arraste os cards para as etapas de Negociação. Quando ele comprar, mova para Ativado. Se não quiser no momento, Perda.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

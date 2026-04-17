import React, { useState } from 'react';

interface ClienteCardProps {
  cliente: any;
  onMove?: (id: string, newStatus: string) => void;
}

export default function ClienteCard({ cliente, onMove }: ClienteCardProps) {
  const { razaoSocial, telefone, diasSemComprar, valorUltimoPedido, pipelineStatus, cicloMedioCompra } = cliente;
  const [template, setTemplate] = useState('padrao');
  
  const getMessage = () => {
    const nome = razaoSocial || 'Cliente';
    const dias = diasSemComprar || '?';
    const valor = valorUltimoPedido ? `R$ ${valorUltimoPedido}` : 'seu último pedido';
    const ciclo = cicloMedioCompra ? Math.round(cicloMedioCompra) : '?';

    switch(template) {
      case 'padrao':
        return `Olá ${nome}, notamos que seu último pedido foi há ${dias} dias. Temos novidades imperdíveis no catálogo Fenié Pro+!`;
      case 'estoque':
        return `Olá ${nome}! Vimos que seu ciclo médio é de ${ciclo} dias. Está na hora de repor o estoque? Estamos à disposição!`;
      case 'saudacao':
        return `Olá ${nome}, tudo bem? A Fenié Pro+ tem lançamentos especiais para profissionais. Vamos conversar?`;
      default:
        return `Olá ${nome}, como podemos ajudar hoje?`;
    }
  };

  const handleWhatsApp = () => {
    if (!telefone) {
      alert("Cliente sem telefone válido cadastrado no formato padrão.");
      return;
    }
    // Isolar o primeiro telefone caso haja múltiplos (ex: "41 9999-9999, 41 8888-8888")
    const primeiroTelefone = telefone.split(/[,/]/)[0];
    const cleanPhone = primeiroTelefone.replace(/\D/g, '');
    
    // Garantir que a URL abra no WhatsApp enviando para o Brasil (55)
    const message = encodeURIComponent(getMessage());
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

  const getCardColor = () => {
    switch (pipelineStatus) {
      case 'OPORTUNIDADE': return 'border-orange-400 bg-orange-50';
      case 'CONTATO_INICIAL': return 'border-blue-400 bg-blue-50';
      case 'EM_NEGOCIACAO': return 'border-purple-400 bg-purple-50';
      case 'ATIVADO': return 'border-green-400 bg-green-50';
      case 'PERDIDO': return 'border-red-400 bg-red-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  return (
    <div className={`p-4 rounded-xl border-l-4 shadow-sm mb-3 ${getCardColor()} transition-transform hover:scale-[1.02] cursor-pointer`}>
      <h4 className="font-semibold text-gray-800 text-sm mb-1 truncate" title={razaoSocial}>{razaoSocial}</h4>
      
      <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
        <span>Há {diasSemComprar || '?'} dias s/ compra</span>
        <span className="font-medium text-gray-700">R$ {valorUltimoPedido || '0'}</span>
      </div>

      <div className="flex flex-col gap-2 mt-3">
        <select 
          value={template} 
          onChange={(e) => setTemplate(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="text-xs border-gray-300 rounded-md bg-white p-1 text-gray-700 w-full"
        >
          <option value="padrao">Template: Saudação + Dias</option>
          <option value="estoque">Template: Alerta de Estoque</option>
          <option value="saudacao">Template: Lançamentos</option>
        </select>

        <button 
          onClick={(e) => { e.stopPropagation(); handleWhatsApp(); }}
          className="w-full bg-[#25D366] text-white text-xs font-semibold py-1.5 px-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-1 shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.128.552 4.195 1.6 6.02L.2 24l6.113-1.6c1.78.96 3.786 1.472 5.718 1.472 6.646 0 12.03-5.385 12.03-12.03C24.062 5.385 18.677 0 12.031 0zm0 21.68c-1.802 0-3.567-.482-5.115-1.396l-.367-.216-3.805.998.995-3.712-.236-.376C2.564 15.358 2.062 13.722 2.062 12.03 2.062 6.526 6.527 2.062 12.03 2.062c5.505 0 9.968 4.464 9.968 9.968 0 5.503-4.463 9.968-9.968 9.968z"/></svg>
          Enviar Zap
        </button>
      </div>
    </div>
  );
}

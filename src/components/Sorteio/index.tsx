"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { CloudUpload, Download } from "lucide-react";

export default function SorteioExcel() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [winners, setWinners] = useState<Record<string, unknown>[]>([]);
  const [quantidade, setQuantidade] = useState(1);
  const [fileName, setFileName] = useState<string | null>(null);

  const colunasDesejadas = [
    "Nº Inscrição", 
    "Carimbo de data/hora", 
    "Tipo de Inscrição", 
    "Nome Completo da Pessoa Proponente", 
    "Nome Social da Pessoa Proponente", 
    "Nº de CPF da Pessoa Proponente", 
    "Nº de CNPJ da Pessoa Proponente", 
    "Qual é a categoria da atividade?", 
    "Qual é a modalidade da atividade?", 
    "Nome da atividade", 
    "Nome da/o Artista/Liderança do Grupo", 
    "Nome Completo da/o Artista/Liderança do Grupo"
  ];

  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    setFileName(file.name);
  
    const reader = new FileReader();
    reader.readAsBinaryString(file);
  
    reader.onload = (e) => {
      const binaryString = e.target?.result;
      const workbook = XLSX.read(binaryString, { type: "binary" });
  
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
  
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
      if (jsonData.length >= 3 && Array.isArray(jsonData[2])) {
        const headers = jsonData[2].map((header) => String(header).trim());
  
        // Filtra apenas as colunas que você precisa
        const filteredHeaders = headers.filter(header => colunasDesejadas.includes(header));
        
        const formattedData = jsonData.slice(3).map(row => {
          if (!Array.isArray(row)) return {};
  
          const obj: { [key: string]: unknown } = {};
          filteredHeaders.forEach((header: string) => {
            const colIndex = headers.indexOf(header);
            obj[header] = row[colIndex] !== undefined ? row[colIndex] : "";
          });
          return obj;
        });
  
        setData(formattedData);
      } else {
        console.error("Erro ao processar o arquivo: a terceira linha não contém cabeçalhos válidos.");
      }
    };
  };
  

  const handleSorteio = () => {
    if (data.length === 0) return;

    const shuffledData = [...data].sort(() => Math.random() - 0.5);
    const selectedItems = shuffledData.slice(0, quantidade);

    setWinners(selectedItems);
  };

  const exportToExcel = () => {
    if (winners.length === 0) return;

    const dataWithTextFormat = winners.map((item: Record<string, unknown>) => {
      const newItem: Record<string, unknown> = {};

      columnNames.forEach(col => {
        newItem[col] = typeof item[col] === 'number' && item[col] > 9999999999
          ? String(item[col])
          : item[col];
      });

      return newItem;
    });

    const headers = [columnNames];
    const dataWithHeaders = [...headers, ...dataWithTextFormat.map(item => columnNames.map(col => item[col] || ""))];

    const worksheet = XLSX.utils.aoa_to_sheet(dataWithHeaders);

    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");

    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_col(col) + "0";
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          fill: { fgColor: { rgb: "D9EAD3" } },
          font: { bold: true, color: { rgb: "FFFFFF" }, size: 12 },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      }
    }

    for (let row = 1; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_col(col) + row;
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = {
            fill: {
              fgColor: row % 2 === 0 ? { rgb: "F4F4F4" } : { rgb: "FFFFFF" },
            },
            alignment: { horizontal: "left" },
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } }
            }
          };
        }
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sorteados");

    worksheet['!cols'] = columnNames.map(col => ({
      wch: col.length + 5
    }));

    XLSX.writeFile(workbook, "sorteio_resultado.xlsx");
  };

  const columnNames: string[] = data[0] ? Object.keys(data[0]) : [];
  const botaoRef = useRef<HTMLButtonElement>(null);

  const handleKeyUp = (event: { key: string; preventDefault: () => void; }) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      botaoRef.current?.click();
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg">
        <div className="flex items-center justify-between w-full">
          <label className="cursor-pointer flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-400 rounded-lg py-6 bg-gray-50 hover:bg-gray-100 transition">
            <CloudUpload size={40} className="text-blue-500 mb-2" />
            <span className="text-gray-600 font-semibold">
              {fileName ? `📂 ${fileName}` : "Clique para enviar um arquivo"}
            </span>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {data.length > 0 && (
          <div className="mt-4">
            <label className="block font-semibold mb-1 text-black">Quantidade de sorteados:</label>
            <input
              type="number"
              min="1"
              max={data.length}
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
              className="border p-2 w-full rounded text-black"
              onKeyUp={handleKeyUp}
            />
          </div>
        )}

        {data.length > 0 && (
          <button onClick={handleSorteio} ref={botaoRef} className="w-full px-4 py-2 mt-4 bg-blue-500 text-white rounded font-semibold hover:bg-blue-600 transition">
            Sortear
          </button>
        )}
      </div>

      {winners.length > 0 && (
        <div className="mt-6 bg-white shadow-md rounded-lg p-6 w-full min-h-full">
          <div className="flex justify-end">
            <button onClick={exportToExcel} className="w-26 px-4 py-2 mt-4 bg-green-500 text-white rounded font-semibold hover:bg-green-600 transition flex items-center justify-center">
              <Download size={20} className="mr-2" /> Exportar para Excel
            </button>
          </div>
          <h2 className="text-3xl mb-4 font-bold text-green-600 text-center">Sorteados</h2>
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-blue-500">
                  {columnNames.map((column, index) => (
                    <th key={index} className="border p-2 text-left text-white">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {winners.length === 0 ? (
                  <tr>
                    <td colSpan={columnNames.length} className="text-center p-2">Nenhum sorteado</td>
                  </tr>
                ) : (
                  winners.map((item, index) => (
                    <tr key={index} className="border text-black">
                      {columnNames.map((column, colIndex) => {
                        // Garantir que item[column] seja renderizável (string, número, etc.)
                        const cellValue = item[column] ?? "Sem valor";  // Se item[column] for null ou undefined, coloca "Sem valor"
                        return (
                          <td key={colIndex} className="border p-2">{String(cellValue)}</td>  // Garantir que é uma string renderizável
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>
        </div>
      )}
    </div>
  );
}

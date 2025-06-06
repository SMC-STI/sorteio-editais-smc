"use client";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function ExportStyledExcelButton() {
  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("modelo-excel");

    // Cabeçalhos
    worksheet.columns = [
      { header: "Número de Inscrição", key: "num_inscricao" },
      { header: "Nome do Projeto/Iniciativa", key: "nome_projeto" },
      { header: "Nome do Proponente", key: "nome_proponente" },
      { header: "Documento", key: "documento" },
    ];

    // Ajustar largura automática nas colunas, exceto C
    worksheet.columns.forEach((column, index) => {
      let maxLength = 10;
      const headerLength = column.header ? column.header.toString().length : 10;
      maxLength = Math.max(maxLength, headerLength);

      if (index === 2) {
        // Coluna C (3ª coluna)
        column.width = 50;
      } else {
        column.width = maxLength + 10;
      }
    });

    // Estilizar cabeçalho (linha 1)
    worksheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "6489A7" },
      };
      cell.font = {
        color: { argb: "000000" },
        size: 14,
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    // Gerar o arquivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "modelo-excel.xlsx");
  };

  return (
    <button
      onClick={handleExport}
      className="text-blue-700 hover:text-blue-500"
    >
      Baixar Modelo
    </button>
  );
}

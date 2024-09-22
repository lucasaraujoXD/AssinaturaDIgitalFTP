import React, { useState, useRef } from 'react';
import { uploadDocument, saveSignature } from '../services/documentService'; // Importando corretamente
import * as XLSX from 'xlsx'; // Biblioteca para leitura de planilhas Excel
import ExcelJS from 'exceljs'; // Biblioteca para manipulação avançada de Excel
import SignatureCanvas from 'react-signature-canvas';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  background-color: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
`;

const Input = styled.input`
  margin-bottom: 10px;
  padding: 10px;
  width: 100%;
`;

const Button = styled.button`
  margin-top: 10px;
  padding: 10px;
  background-color: #ffcc00; /* Amarelo forte */
  color: #000;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #e6b800; /* Efeito hover */
  }
`;

const Table = styled.table`
  border: 1px solid black;
  border-collapse: collapse;
  width: 100%;
`;

const TableHeader = styled.th`
  border: 1px solid black;
  padding: 8px;
`;

const TableCell = styled.td`
  border: 1px solid black;
  padding: 8px;
`;

const UploadDocument = () => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const sigCanvas = useRef({});

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile && (selectedFile.type === 'application/vnd.ms-excel' || selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        setData(jsonData);
        setError('');
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      setError('Por favor, selecione um arquivo Excel (.xls ou .xlsx) válido.');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor, selecione um arquivo antes de fazer o upload.');
      return;
    }

    try {
      await uploadDocument(file); // Usando a função de serviço
      alert('Documento enviado com sucesso!');
      setFile(null);
    } catch (error) {
      setError('O upload falhou. Tente novamente.');
    }
  };

  const clearSignature = () => sigCanvas.current.clear();

  const saveWithSignature = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    data.forEach((row) => {
      worksheet.addRow(row);
    });

    if (sigCanvas.current.getTrimmedCanvas()) {
      const imgData = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      await saveSignature(imgData); // Salvando a assinatura usando a função de serviço

      const response = await fetch(imgData);
      const buffer = await response.arrayBuffer();

      const img = workbook.addImage({
        buffer,
        extension: 'png',
      });

      worksheet.addImage(img, {
        tl: { col: 0, row: data.length + 2 },
        ext: { width: 100, height: 50 },
      });
    }

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document_with_signature.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  };

  return (
    <Container>
      <h3>Selecionar Documento</h3>
      <Input type="file" accept=".xls,.xlsx" onChange={handleFileChange} />
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {data.length > 0 && (
        <div>
          <h4>Dados do Documento:</h4>
          <Table>
            <thead>
              <tr>
                {data[0].map((key, index) => (
                  <TableHeader key={index}>{key}</TableHeader>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(1).map((row, index) => (
                <tr key={index}>
                  {row.map((value, i) => (
                    <TableCell key={i}>{value}</TableCell>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>

          <div>
            <h4>Assinatura do Responsável</h4>
            <SignatureCanvas ref={sigCanvas} canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }} />
            <Button onClick={clearSignature}>Limpar Assinatura</Button>
            <Button onClick={saveWithSignature}>Salvar com Assinatura</Button>
          </div>
        </div>
      )}
    </Container>
  );
};

export default UploadDocument;

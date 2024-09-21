import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import SignatureCanvas from 'react-signature-canvas';

const UploadDocument = () => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const sigCanvas = React.useRef({});

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const formData = new FormData();
      formData.append('document', selectedFile);

      try {
        const response = await axios.post('http://localhost:5000/documents', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Upload response:', response.data);
        alert('Document uploaded successfully');

        // Read the contents of the Excel file
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          if (worksheet) {
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            setData(jsonData);
            setError(''); // Clear any error
          } else {
            setError('No data found in the selected sheet.');
          }
        };
        reader.readAsArrayBuffer(selectedFile); // Mantenha essa linha

        setFile(null); // Clear the file after upload
      } catch (error) {
        console.error('Upload failed:', error);
        if (error.response) {
          console.log('Error response:', error.response.data);
          setError(`Upload failed: ${error.response.data.message || error.response.data}`);
        } else {
          setError('Upload failed. Please try again.');
        }
      }
    }
  };

  const saveWithSignature = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Add data to the worksheet
    data.forEach((row) => {
      worksheet.addRow(row);
    });

    if (sigCanvas.current.getTrimmedCanvas()) {
      const imgData = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      const response = await fetch(imgData);
      const buffer = await response.arrayBuffer();

      const img = workbook.addImage({
        buffer,
        extension: 'png',
      });

      worksheet.addImage(img, {
        tl: { col: 0, row: data.length + 2 }, // Position of the image (cell destination)
        ext: { width: 100, height: 50 }, // Image dimensions
      });
    }

    // Save the updated file
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
    <div>
      <h3>Selecionar Documento</h3>
      <input type="file" accept=".xls,.xlsx" onChange={handleFileChange} />
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {data.length > 0 && (
        <div>
          <h4>Document Data:</h4>
          <table style={{ border: '1px solid black', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key} style={{ border: '1px solid black' }}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i} style={{ border: '1px solid black' }}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            <h4>Assinatura do Responsável</h4>
            <SignatureCanvas ref={sigCanvas} canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }} />
            <button onClick={saveWithSignature}>Salvar Assinatura</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadDocument;

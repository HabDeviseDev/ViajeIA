import React, { useState, useEffect } from 'react';
import './App.css';
import jsPDF from 'jspdf';

function App() {
  const [formularioCompletado, setFormularioCompletado] = useState(false);
  const [datosViaje, setDatosViaje] = useState({
    destino: '',
    fecha: '',
    presupuesto: '',
    preferencia: ''
  });
  const [pregunta, setPregunta] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [fotos, setFotos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [primeraVez, setPrimeraVez] = useState(true);
  const [destinoInfo, setDestinoInfo] = useState(null);
  const [cargandoInfo, setCargandoInfo] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [mostrarFavoritos, setMostrarFavoritos] = useState(false);
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargandoEstadisticas, setCargandoEstadisticas] = useState(false);

  const handleFormularioSubmit = (e) => {
    e.preventDefault();
    if (datosViaje.destino && datosViaje.fecha && datosViaje.presupuesto && datosViaje.preferencia) {
      setFormularioCompletado(true);
      // Cargar información del destino cuando se completa el formulario
      loadDestinoInfo(datosViaje.destino);
    }
  };

  // Función para cargar información del destino
  const loadDestinoInfo = async (destino) => {
    if (!destino || destino.trim().length < 2) return;
    
    setCargandoInfo(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/destino-info/${encodeURIComponent(destino.trim())}`);
      
      if (response.ok) {
        const data = await response.json();
        setDestinoInfo(data);
      }
    } catch (error) {
      console.error('Error al cargar información del destino:', error);
    } finally {
      setCargandoInfo(false);
    }
  };

  // Cargar historial desde localStorage al iniciar
  useEffect(() => {
    const savedHistorial = localStorage.getItem('viajeia_historial');
    if (savedHistorial) {
      try {
        setHistorial(JSON.parse(savedHistorial));
      } catch (e) {
        console.error('Error al cargar historial:', e);
      }
    }
  }, []);

  // Guardar historial en localStorage cuando cambia
  useEffect(() => {
    if (historial.length > 0) {
      localStorage.setItem('viajeia_historial', JSON.stringify(historial));
    }
  }, [historial]);

  // Limpiar historial cuando cambia el destino
  useEffect(() => {
    if (formularioCompletado && datosViaje.destino) {
      loadDestinoInfo(datosViaje.destino);
      // Opcional: limpiar historial cuando cambia el destino (comentado para mantener contexto)
      // setHistorial([]);
    }
  }, [formularioCompletado, datosViaje.destino]);

  // Cargar estadísticas
  const loadEstadisticas = async () => {
    setCargandoEstadisticas(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/estadisticas`);
      if (response.ok) {
        const data = await response.json();
        setEstadisticas(data);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setCargandoEstadisticas(false);
    }
  };

  // Cargar estadísticas al montar el componente y cada minuto
  useEffect(() => {
    loadEstadisticas();
    const interval = setInterval(loadEstadisticas, 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, []);

  // Funciones para manejar favoritos
  const guardarFavorito = () => {
    if (!datosViaje.destino) return;

    const favorito = {
      id: Date.now(),
      destino: datosViaje.destino,
      fecha: datosViaje.fecha,
      presupuesto: datosViaje.presupuesto,
      preferencia: datosViaje.preferencia,
      fechaGuardado: new Date().toISOString(),
      historial: historial,
      fotos: fotos
    };

    // Verificar si ya existe
    const existe = favoritos.find(f => f.destino.toLowerCase() === datosViaje.destino.toLowerCase());
    if (!existe) {
      setFavoritos(prev => [...prev, favorito]);
    }
  };

  const eliminarFavorito = (id) => {
    setFavoritos(prev => prev.filter(f => f.id !== id));
  };

  const cargarFavorito = (favorito) => {
    setDatosViaje({
      destino: favorito.destino,
      fecha: favorito.fecha,
      presupuesto: favorito.presupuesto,
      preferencia: favorito.preferencia
    });
    if (favorito.historial) {
      setHistorial(favorito.historial);
    }
    if (favorito.fotos) {
      setFotos(favorito.fotos);
    }
    setFormularioCompletado(true);
    loadDestinoInfo(favorito.destino);
    setMostrarFavoritos(false);
  };

  const esFavorito = () => {
    return favoritos.some(f => f.destino.toLowerCase() === datosViaje.destino.toLowerCase());
  };

  const handleInputChange = (field, value) => {
    setDatosViaje(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validar y sanitizar entrada del usuario
  const sanitizeInput = (input) => {
    if (!input || typeof input !== 'string') {
      return '';
    }
    // Limitar longitud
    if (input.length > 5000) {
      return input.substring(0, 5000);
    }
    return input.trim();
  };

  // Función para generar y descargar el PDF del itinerario
  const generarPDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Función auxiliar para agregar una nueva página si es necesario
    const checkNewPage = (requiredHeight) => {
      if (yPosition + requiredHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Función para agregar texto con wrap
    const addText = (text, fontSize, isBold = false, color = [0, 0, 0], align = 'left') => {
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      pdf.setTextColor(...color);
      
      const textLines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
      textLines.forEach(line => {
        checkNewPage(fontSize / 2);
        pdf.text(line, margin, yPosition, { align });
        yPosition += fontSize / 2 + 2;
      });
    };

    // Función para cargar imagen desde URL
    const addImageFromUrl = async (url, width, height) => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });

        checkNewPage(height);
        pdf.addImage(img, 'JPEG', margin, yPosition, width, height, undefined, 'FAST');
        yPosition += height + 10;
        return true;
      } catch (error) {
        console.error('Error al cargar imagen:', error);
        return false;
      }
    };

    try {
      // Logo/Título de ViajeIA
      pdf.setFillColor(37, 99, 235);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ViajeIA', pageWidth / 2, 25, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text('Tu Asistente Personal de Viajes', pageWidth / 2, 32, { align: 'center' });
      
      yPosition = 50;

      // Información del viaje
      pdf.setTextColor(37, 99, 235);
      addText('INFORMACIÓN DEL VIAJE', 16, true, [37, 99, 235]);
      yPosition += 5;

      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      addText(`Destino: ${datosViaje.destino}`, 12, true);
      addText(`Fecha: ${new Date(datosViaje.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`, 12);
      addText(`Presupuesto: ${datosViaje.presupuesto}`, 12);
      addText(`Preferencia: ${datosViaje.preferencia}`, 12);
      
      yPosition += 10;

      // Fotos del destino
      if (fotos && fotos.length > 0) {
        checkNewPage(60);
        pdf.setTextColor(37, 99, 235);
        addText('FOTOS DEL DESTINO', 14, true, [37, 99, 235]);
        yPosition += 5;

        const imageWidth = 50;
        const imageHeight = 50;
        const spacing = 10;
        let xPos = margin;
        let currentRowY = yPosition;

        for (let i = 0; i < Math.min(3, fotos.length); i++) {
          const foto = fotos[i];
          if (foto && foto.url) {
            checkNewPage(imageHeight + 25);
            
            try {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              
              await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
                img.onload = () => {
                  clearTimeout(timeout);
                  resolve();
                };
                img.onerror = () => {
                  clearTimeout(timeout);
                  reject(new Error('Image load failed'));
                };
                img.src = foto.url;
              });

              // Agregar imagen
              pdf.addImage(img, 'JPEG', xPos, currentRowY, imageWidth, imageHeight, undefined, 'FAST');
              
              // Crédito
              pdf.setFontSize(7);
              pdf.setTextColor(120, 120, 120);
              pdf.text(`Foto: ${foto.photographer || 'Unsplash'}`, xPos, currentRowY + imageHeight + 4, { maxWidth: imageWidth });
              
              xPos += imageWidth + spacing;
              
              // Nueva fila cada 3 imágenes
              if ((i + 1) % 3 === 0) {
                currentRowY += imageHeight + 20;
                xPos = margin;
              }
            } catch (error) {
              console.error('Error al cargar imagen:', error);
              // Continuar con la siguiente imagen
              xPos += imageWidth + spacing;
              if ((i + 1) % 3 === 0) {
                currentRowY += imageHeight + 20;
                xPos = margin;
              }
            }
          }
        }
        
        // Ajustar posición final
        if (fotos.length % 3 !== 0) {
          currentRowY += imageHeight + 20;
        }
        yPosition = currentRowY + 10;
      }

      // Historial de conversación / Recomendaciones
      if (historial && historial.length > 0) {
        checkNewPage(30);
        pdf.setTextColor(37, 99, 235);
        addText('RECOMENDACIONES Y CONSEJOS', 14, true, [37, 99, 235]);
        yPosition += 10;

        // Filtrar solo las respuestas del asistente
        const recomendaciones = historial.filter(msg => msg.role === 'assistant');
        
        recomendaciones.forEach((msg, index) => {
          checkNewPage(30);
          
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`Recomendación ${index + 1}:`, margin, yPosition);
          yPosition += 7;

          // Formatear la respuesta
          const content = msg.content;
          const lines = content.split('\n');
          
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
          
          lines.forEach(line => {
            line = line.trim();
            if (line) {
              // Detectar categorías
              if (line.match(/^[»Þäø]\s+[A-Z\s]+:/)) {
                checkNewPage(8);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(30, 64, 175);
                const textLines = pdf.splitTextToSize(line, pageWidth - 2 * margin - 10);
                textLines.forEach(textLine => {
                  pdf.text(textLine, margin + 5, yPosition);
                  yPosition += 7;
                });
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(0, 0, 0);
              } else if (line.startsWith('•') || line.startsWith('-')) {
                checkNewPage(6);
                const textLines = pdf.splitTextToSize(line, pageWidth - 2 * margin - 10);
                textLines.forEach(textLine => {
                  pdf.text(textLine, margin + 10, yPosition);
                  yPosition += 6;
                });
              } else {
                checkNewPage(6);
                const textLines = pdf.splitTextToSize(line, pageWidth - 2 * margin - 10);
                textLines.forEach(textLine => {
                  pdf.text(textLine, margin + 5, yPosition);
                  yPosition += 6;
                });
              }
            }
          });
          
          yPosition += 8;
          
          // Línea separadora
          if (index < recomendaciones.length - 1) {
            pdf.setDrawColor(200, 200, 200);
            pdf.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 5;
          }
        });
      } else if (respuesta) {
        // Si no hay historial pero hay una respuesta actual
        checkNewPage(30);
        pdf.setTextColor(37, 99, 235);
        addText('RECOMENDACIONES', 14, true, [37, 99, 235]);
        yPosition += 10;

        const lines = respuesta.split('\n');
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        
        lines.forEach(line => {
          line = line.trim();
          if (line) {
            if (line.match(/^[»Þäø]\s+[A-Z\s]+:/)) {
              checkNewPage(8);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(30, 64, 175);
              const textLines = pdf.splitTextToSize(line, pageWidth - 2 * margin - 10);
              textLines.forEach(textLine => {
                pdf.text(textLine, margin + 5, yPosition);
                yPosition += 7;
              });
              pdf.setFont('helvetica', 'normal');
              pdf.setTextColor(0, 0, 0);
            } else if (line.startsWith('•') || line.startsWith('-')) {
              checkNewPage(6);
              const textLines = pdf.splitTextToSize(line, pageWidth - 2 * margin - 10);
              textLines.forEach(textLine => {
                pdf.text(textLine, margin + 10, yPosition);
                yPosition += 6;
              });
            } else {
              checkNewPage(6);
              const textLines = pdf.splitTextToSize(line, pageWidth - 2 * margin - 10);
              textLines.forEach(textLine => {
                pdf.text(textLine, margin + 5, yPosition);
                yPosition += 6;
              });
            }
          }
        });
      }

      // Footer
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Página ${i} de ${totalPages} - Generado por ViajeIA`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Descargar el PDF
      const fileName = `Itinerario_${datosViaje.destino.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intenta de nuevo.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar y sanitizar entrada
    const preguntaSanitizada = sanitizeInput(pregunta);
    
    if (!preguntaSanitizada) {
      setRespuesta('Por favor, escribe una pregunta válida.');
      return;
    }

    // Validar longitud antes de enviar
    const contexto = `Información del viaje:
- Destino: ${sanitizeInput(datosViaje.destino)}
- Fecha: ${datosViaje.fecha}
- Presupuesto: ${sanitizeInput(datosViaje.presupuesto)}
- Preferencia: ${sanitizeInput(datosViaje.preferencia)}

Pregunta: ${preguntaSanitizada}`;

    if (contexto.length > 5000) {
      setRespuesta('Tu mensaje es demasiado largo. Por favor, acórtalo.');
      return;
    }

    setCargando(true);
    setRespuesta('');
    setFotos([]);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/api/planificar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          pregunta: contexto,
          historial: historial  // Enviar historial de conversación
        }),
      });

      if (!response.ok) {
        // Manejar diferentes tipos de errores
        if (response.status === 429) {
          setRespuesta('Has hecho demasiadas solicitudes. Por favor, espera un momento antes de intentar de nuevo.');
        } else if (response.status === 400) {
          const errorData = await response.json().catch(() => ({}));
          setRespuesta(errorData.detail || 'Por favor, verifica que tu mensaje sea válido.');
        } else if (response.status === 500 || response.status === 503) {
          setRespuesta('El servicio no está disponible en este momento. Por favor, intenta más tarde.');
        } else {
          setRespuesta('Error al procesar tu solicitud. Por favor, intenta de nuevo.');
        }
        setPrimeraVez(false);
        return;
      }

      const data = await response.json();
      
      // Validar que la respuesta sea válida
      if (data && data.respuesta) {
        setRespuesta(data.respuesta);
        // Establecer las fotos si vienen en la respuesta
        if (data.fotos && Array.isArray(data.fotos)) {
          setFotos(data.fotos);
        } else {
          setFotos([]);
        }
        
        // Agregar pregunta y respuesta al historial
        setHistorial(prev => [...prev, 
          { role: 'user', content: preguntaSanitizada },
          { role: 'assistant', content: data.respuesta }
        ]);
        
        // Limpiar el campo de pregunta
        setPregunta('');
      } else {
        setRespuesta('No se recibió una respuesta válida del servidor.');
        setFotos([]);
      }
      
      setPrimeraVez(false);
    } catch (error) {
      console.error('Error:', error);
      // No exponer detalles del error al usuario
      setRespuesta('Error de conexión. Por favor, verifica que el servidor esté corriendo e intenta de nuevo.');
      setPrimeraVez(false);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="App">
      <div className="app-layout">
        <div className="container">
        <header className="header">
          <div className="header-content">
            <h1 className="title">ViajeIA - Tu Asistente Personal de Viajes</h1>
            <div className="header-buttons">
              {estadisticas && (
                <div className="stats-badge">
                  👥 {estadisticas.total_usuarios} usuarios • 📊 {estadisticas.total_consultas} consultas
                </div>
              )}
              {formularioCompletado && (
                <button
                  className="favorites-toggle-button"
                  onClick={() => setMostrarFavoritos(!mostrarFavoritos)}
                  title="Ver mis viajes guardados"
                >
                  {mostrarFavoritos ? '✕ Cerrar' : '⭐ Mis Viajes Guardados'}
                  {favoritos.length > 0 && <span className="favoritos-count">({favoritos.length})</span>}
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="main-content">
          {/* Panel de Estadísticas */}
          {estadisticas && !mostrarFavoritos && (
            <div className="estadisticas-panel">
              <h2 className="estadisticas-title">📊 Estadísticas de ViajeIA</h2>
              <div className="estadisticas-grid">
                <div className="estadistica-card">
                  <div className="estadistica-icon">👥</div>
                  <div className="estadistica-value">{estadisticas.total_usuarios}</div>
                  <div className="estadistica-label">Usuarios únicos</div>
                </div>
                <div className="estadistica-card">
                  <div className="estadistica-icon">💬</div>
                  <div className="estadistica-value">{estadisticas.consultas_hoy}</div>
                  <div className="estadistica-label">Consultas hoy</div>
                </div>
                <div className="estadistica-card">
                  <div className="estadistica-icon">📈</div>
                  <div className="estadistica-value">{estadisticas.total_consultas}</div>
                  <div className="estadistica-label">Total consultas</div>
                </div>
              </div>
              
              {estadisticas.destinos_mas_consultados && estadisticas.destinos_mas_consultados.length > 0 && (
                <div className="destinos-populares">
                  <h3 className="destinos-populares-title">🌍 Destinos más consultados</h3>
                  <div className="destinos-list">
                    {estadisticas.destinos_mas_consultados.map((item, index) => (
                      <div key={index} className="destino-popular-item">
                        <span className="destino-rank">#{index + 1}</span>
                        <span className="destino-nombre">{item.destino}</span>
                        <span className="destino-count">{item.consultas} consultas</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sección de Favoritos */}
          {mostrarFavoritos && (
            <div className="favoritos-section">
              <div className="favoritos-header">
                <h2>⭐ Mis Viajes Guardados</h2>
                <p className="favoritos-subtitle">
                  {favoritos.length > 0 
                    ? `${favoritos.length} ${favoritos.length === 1 ? 'destino guardado' : 'destinos guardados'}` 
                    : 'No tienes destinos guardados aún'}
                </p>
              </div>
              
              {favoritos.length > 0 ? (
                <div className="favoritos-grid">
                  {favoritos.map((favorito) => (
                    <div key={favorito.id} className="favorito-card">
                      <div className="favorito-header-card">
                        <h3 className="favorito-destino">{favorito.destino}</h3>
                        <button
                          className="eliminar-favorito-btn"
                          onClick={() => eliminarFavorito(favorito.id)}
                          title="Eliminar de favoritos"
                        >
                          🗑️
                        </button>
                      </div>
                      <div className="favorito-info">
                        <p><strong>Fecha:</strong> {new Date(favorito.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        <p><strong>Presupuesto:</strong> {favorito.presupuesto}</p>
                        <p><strong>Preferencia:</strong> {favorito.preferencia}</p>
                        {favorito.fotos && favorito.fotos.length > 0 && (
                          <div className="favorito-foto-preview">
                            <img 
                              src={favorito.fotos[0].url} 
                              alt={favorito.destino}
                              className="favorito-thumbnail"
                            />
                          </div>
                        )}
                      </div>
                      <button
                        className="cargar-favorito-btn"
                        onClick={() => cargarFavorito(favorito)}
                      >
                        📍 Cargar este destino
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="favoritos-empty">
                  <p>💭 Aún no has guardado ningún destino.</p>
                  <p>Completa el formulario y guarda tus destinos favoritos para consultarlos después.</p>
                </div>
              )}
            </div>
          )}

          {!formularioCompletado && !mostrarFavoritos ? (
            <>
              <div className="survey-intro">
                <p className="survey-intro-text">
                  👋 ¡Hola! Soy <strong>Alex, tu consultor personal de viajes</strong>. ✈️
                </p>
                <p className="survey-intro-text">
                  Para ayudarte mejor, cuéntame un poco sobre tu viaje:
                </p>
              </div>

              <form onSubmit={handleFormularioSubmit} className="survey-form">
                <div className="form-group">
                  <label className="form-label">
                    🌍 ¿A dónde quieres viajar?
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: París, Tokio, Cancún..."
                    value={datosViaje.destino}
                    onChange={(e) => handleInputChange('destino', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    📅 ¿Cuándo?
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={datosViaje.fecha}
                    onChange={(e) => handleInputChange('fecha', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    💰 ¿Cuál es tu presupuesto aproximado?
                  </label>
                  <select
                    className="form-select"
                    value={datosViaje.presupuesto}
                    onChange={(e) => handleInputChange('presupuesto', e.target.value)}
                    required
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="Económico (menos de $500)">Económico (menos de $500)</option>
                    <option value="Moderado ($500 - $1,500)">Moderado ($500 - $1,500)</option>
                    <option value="Comfortable ($1,500 - $3,000)">Comfortable ($1,500 - $3,000)</option>
                    <option value="Lujo (más de $3,000)">Lujo (más de $3,000)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    🎯 ¿Qué prefieres?
                  </label>
                  <div className="preference-options">
                    <label className={`preference-option ${datosViaje.preferencia === 'Aventura' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="preferencia"
                        value="Aventura"
                        checked={datosViaje.preferencia === 'Aventura'}
                        onChange={(e) => handleInputChange('preferencia', e.target.value)}
                        required
                      />
                      <span className="preference-label">🏔️ Aventura</span>
                    </label>
                    <label className={`preference-option ${datosViaje.preferencia === 'Relajación' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="preferencia"
                        value="Relajación"
                        checked={datosViaje.preferencia === 'Relajación'}
                        onChange={(e) => handleInputChange('preferencia', e.target.value)}
                        required
                      />
                      <span className="preference-label">🏖️ Relajación</span>
                    </label>
                    <label className={`preference-option ${datosViaje.preferencia === 'Cultura' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="preferencia"
                        value="Cultura"
                        checked={datosViaje.preferencia === 'Cultura'}
                        onChange={(e) => handleInputChange('preferencia', e.target.value)}
                        required
                      />
                      <span className="preference-label">🏛️ Cultura</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="submit-button"
                >
                  Continuar →
                </button>
              </form>
            </>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="form">
                <div className="input-container">
                  <textarea
                    className="input-field"
                    placeholder="Escribe tu pregunta sobre tu viaje..."
                    value={pregunta}
                    onChange={(e) => setPregunta(e.target.value)}
                    rows="4"
                    disabled={cargando}
                  />
                </div>

                <button
                  type="submit"
                  className="submit-button"
                  disabled={cargando || !pregunta.trim()}
                >
                  {cargando ? 'Planificando...' : 'Planificar mi viaje'}
                </button>
              </form>

              {/* Historial de conversación */}
              {historial.length > 0 && (
                <div className="historial-container">
                  <div className="historial-header">
                    <h3>💬 Historial de Conversación</h3>
                    <button 
                      className="clear-historial-btn"
                      onClick={() => {
                        setHistorial([]);
                        localStorage.removeItem('viajeia_historial');
                      }}
                      title="Limpiar historial"
                    >
                      🗑️ Limpiar
                    </button>
                  </div>
                  <div className="historial-messages">
                    {historial.map((msg, index) => (
                      <div key={index} className={`historial-message ${msg.role}`}>
                        <div className="message-role">
                          {msg.role === 'user' ? '👤 Tú' : '🤖 Alex'}
                        </div>
                        <div className="message-content">
                          {msg.role === 'user' ? msg.content : (
                            <>
                              {msg.content.split('\n').slice(0, 3).join('\n')}
                              {msg.content.split('\n').length > 3 && '...'}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {primeraVez && !respuesta && !cargando && (
                <div className="welcome-container">
                  <div className="welcome-content">
                    <p className="welcome-text">
                      ¡Perfecto! 🎉 Ya tengo tu información:
                    </p>
                    <ul className="info-list">
                      <li>📍 Destino: <strong>{datosViaje.destino}</strong></li>
                      <li>📅 Fecha: <strong>{new Date(datosViaje.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></li>
                      <li>💰 Presupuesto: <strong>{datosViaje.presupuesto}</strong></li>
                      <li>🎯 Preferencia: <strong>{datosViaje.preferencia}</strong></li>
                    </ul>
                    <p className="welcome-text">
                      Ahora puedes hacerme cualquier pregunta sobre tu viaje y te daré recomendaciones personalizadas. ✈️🌍
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {respuesta && (
            <>
              <div className="pdf-download-section">
                <div className="action-buttons-row">
                  <button
                    className="pdf-download-button"
                    onClick={generarPDF}
                    disabled={cargando}
                  >
                    📄 Descargar mi itinerario en PDF
                  </button>
                  
                  <button
                    className={`favorito-button ${esFavorito() ? 'favorito-activo' : ''}`}
                    onClick={guardarFavorito}
                    disabled={cargando || !datosViaje.destino || esFavorito()}
                    title={esFavorito() ? 'Destino ya guardado' : 'Guardar destino en favoritos'}
                  >
                    {esFavorito() ? '✅ Guardado en Favoritos' : '⭐ Guardar en Favoritos'}
                  </button>
                </div>
              </div>

              {fotos && fotos.length > 0 && (
                <div className="photos-container">
                  <h3 className="photos-title">📸 Fotos de {datosViaje.destino || 'tu destino'}</h3>
                  <div className="photos-grid">
                    {fotos.map((foto, index) => (
                      <div key={index} className="photo-item">
                        <img
                          src={foto.url}
                          alt={foto.description || `Foto ${index + 1} del destino`}
                          className="destination-photo"
                          loading="lazy"
                        />
                        <div className="photo-credit">
                          Foto por <a href={foto.photographer_url} target="_blank" rel="noopener noreferrer" className="photographer-link">{foto.photographer}</a> en Unsplash
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="response-container">
                <div className="response-content">
                  {respuesta.split('\n').map((line, index) => {
                    const trimmedLine = line.trim();
                    // Detectar líneas que son títulos de categorías
                    const isCategoryTitle = trimmedLine.match(/^[»Þäø]\s+[A-Z\s]+:/);
                    
                    if (isCategoryTitle) {
                      return (
                        <p key={index} className="response-category">
                          {line}
                        </p>
                      );
                    } else if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
                      return (
                        <p key={index} className="bullet-point">
                          {line}
                        </p>
                      );
                    } else if (trimmedLine) {
                      return (
                        <p key={index} className="response-category-content">
                          {line}
                        </p>
                      );
                    } else {
                      return <br key={index} />;
                    }
                  })}
                </div>
              </div>
            </>
          )}
        </main>
        </div>

        {/* Panel lateral con información del destino */}
        {formularioCompletado && (
          <aside className="info-sidebar">
            <div className="sidebar-header">
              <h3>📊 Información del Destino</h3>
              <p className="destino-nombre">{datosViaje.destino}</p>
            </div>

            {cargandoInfo ? (
              <div className="sidebar-loading">Cargando información...</div>
            ) : destinoInfo ? (
              <div className="sidebar-content">
                {/* Temperatura */}
                {destinoInfo.clima && (
                  <div className="info-card">
                    <div className="info-icon">🌡️</div>
                    <div className="info-details">
                      <h4>Temperatura</h4>
                      <p className="info-value">{destinoInfo.clima.temperatura}°C</p>
                      <p className="info-subtitle">{destinoInfo.clima.descripcion}</p>
                      <p className="info-extra">
                        Sensación: {destinoInfo.clima.sensacion_termica}°C
                      </p>
                    </div>
                  </div>
                )}

                {/* Zona Horaria */}
                {destinoInfo.timezone && (
                  <div className="info-card">
                    <div className="info-icon">🕐</div>
                    <div className="info-details">
                      <h4>Hora Local</h4>
                      {destinoInfo.timezone.datetime && (
                        <p className="info-value">
                          {new Date(destinoInfo.timezone.datetime).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: destinoInfo.timezone.timezone
                          })}
                        </p>
                      )}
                      <p className="info-subtitle">{destinoInfo.timezone.timezone}</p>
                      {destinoInfo.timezone.utc_offset && (
                        <p className="info-extra">
                          UTC {destinoInfo.timezone.utc_offset}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Tipo de Cambio */}
                {destinoInfo.exchange_rate && (
                  <div className="info-card">
                    <div className="info-icon">💱</div>
                    <div className="info-details">
                      <h4>Tipo de Cambio</h4>
                      <p className="info-subtitle">1 USD =</p>
                      <div className="exchange-rates">
                        {Object.entries(destinoInfo.exchange_rate.rates || {}).map(([curr, rate]) => (
                          <div key={curr} className="exchange-item">
                            <span className="currency">{curr}</span>
                            <span className="rate">{rate}</span>
                          </div>
                        ))}
                      </div>
                      <p className="info-extra">Actualizado: {destinoInfo.exchange_rate.date}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="sidebar-empty">
                No hay información disponible
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Sección ViajeIA Pro */}
      <div className="pro-section">
        <div className="pro-header">
          <h2 className="pro-title">🚀 Próximamente: ViajeIA Pro</h2>
          <p className="pro-subtitle">Funcionalidades exclusivas que estarán disponibles pronto</p>
        </div>
        
        <div className="pro-features-grid">
          <div className="pro-feature-card">
            <div className="pro-feature-icon">📅</div>
            <h3 className="pro-feature-title">Itinerarios día por día detallados</h3>
            <p className="pro-feature-description">
              Planifica cada día de tu viaje con horarios específicos, actividades organizadas y recomendaciones personalizadas hora por hora.
            </p>
            <div className="pro-badge">Próximamente</div>
          </div>

          <div className="pro-feature-card">
            <div className="pro-feature-icon">🏨</div>
            <h3 className="pro-feature-title">Reservas directas de hoteles</h3>
            <p className="pro-feature-description">
              Reserva hoteles directamente desde la plataforma con precios exclusivos y comparación en tiempo real de múltiples sitios.
            </p>
            <div className="pro-badge">Próximamente</div>
          </div>

          <div className="pro-feature-card">
            <div className="pro-feature-icon">✈️</div>
            <h3 className="pro-feature-title">Alertas de precios de vuelos</h3>
            <p className="pro-feature-description">
              Recibe notificaciones automáticas cuando los precios de vuelos bajen. Ahorra dinero reservando en el momento perfecto.
            </p>
            <div className="pro-badge">Próximamente</div>
          </div>

          <div className="pro-feature-card">
            <div className="pro-feature-icon">∞</div>
            <h3 className="pro-feature-title">Consultas ilimitadas</h3>
            <p className="pro-feature-description">
              Sin límites de preguntas. Planifica todos tus viajes con consultas ilimitadas y acceso prioritario a nuevas funcionalidades.
            </p>
            <div className="pro-badge">Próximamente</div>
          </div>
        </div>

        <div className="pro-cta">
          <p className="pro-cta-text">
            ¿Quieres ser el primero en conocer cuando ViajeIA Pro esté disponible?
          </p>
          <button className="pro-cta-button" disabled>
            🔔 Notificarme cuando esté disponible
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;


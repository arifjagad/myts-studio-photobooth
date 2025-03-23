import React, { useCallback, useRef, useState } from 'react';
import { 
  Download, Image, Sticker, Type, Trash2, Move, 
  Maximize, Settings, X, ChevronRight, ChevronLeft, RefreshCw
} from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { toPng } from 'html-to-image';
import usePhotoboothStore from '../store/photoboothStore';
import { Button, Select, TextInput, Label } from 'flowbite-react';
import Draggable from 'react-draggable';

function FrameCustomizer() {
  const frameRef = useRef(null);
  const [titles, setTitles] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [activeTextId, setActiveTextId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState('frame');
  const [activeStickerIndex, setActiveStickerIndex] = useState(null);
  const MAX_TEXT_LENGTH = 30;
  
  // Available stickers - using the exact paths from your file structure
  const availableStickers = [
    '/assets/heart.png',
    '/assets/kiss.png',
    // You can add more sticker paths as needed
  ];
  
  const {
    photos,
    selectedLayout,
    frameColor,
    setFrameColor,
    textColor,
    setTextColor,
    stickers,
    addSticker,
    updateSticker,
    removeSticker,
    setStep
  } = usePhotoboothStore();

  const fontOptions = [
    { value: 'font-sans', label: 'Sans Serif' },
    { value: 'font-serif', label: 'Serif' },
    { value: 'font-mono', label: 'Monospace' },
    { value: 'font-cursive', label: 'Cursive' },
    { value: 'font-bold', label: 'Bold' },
    { value: 'font-light', label: 'Light' },
  ];

  const getLayoutStyle = () => {
    switch (selectedLayout) {
      case 'vertical':
        return 'flex-col';
      case 'horizontal':
        return 'flex-row';
      case 'square':
        return 'grid grid-cols-2';
      default:
        return 'flex-col';
    }
  };

  const addNewTitle = () => {
    const newTitle = { 
      id: nextId, 
      text: '', 
      font: 'font-sans',
      position: { x: 0, y: 0 },
      fontSize: 24
    };
    setTitles([...titles, newTitle]);
    setNextId(nextId + 1);
    setActiveTextId(newTitle.id);
    setSidebarOpen(true);
    setActiveSidebarTab('text');
  };

  const updateTitleText = (id, newText) => {
    const limitedText = newText.slice(0, MAX_TEXT_LENGTH);
    setTitles(titles.map(title => 
      title.id === id ? { ...title, text: limitedText } : title
    ));
  };

  const updateTitleFont = (id, newFont) => {
    setTitles(titles.map(title => 
      title.id === id ? { ...title, font: newFont } : title
    ));
  };

  const updateTitleFontSize = (id, newSize) => {
    setTitles(titles.map(title => 
      title.id === id ? { ...title, fontSize: newSize } : title
    ));
  };

  const removeTitle = (id) => {
    setTitles(titles.filter(title => title.id !== id));
    if (activeTextId === id) {
      setActiveTextId(null);
    }
  };

  const handleDrag = (id, e, data) => {
    setTitles(titles.map(title => 
      title.id === id ? { ...title, position: { x: data.x, y: data.y } } : title
    ));
  };

  const handleStickerDrag = (id, e, data) => {
    updateSticker(id, { position: { x: data.x, y: data.y } });
  };

  const handleTextClick = (id) => {
    setActiveTextId(id);
    setSidebarOpen(true);
    setActiveSidebarTab('text');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleStickerClick = (index) => {
    // Add the selected sticker directly to the frame
    addSticker({
      url: availableStickers[index],
      position: { x: 0, y: 0 },
      scale: 1,
      rotation: 0
    });
    setActiveStickerIndex(index);
  };

  const handleStickerSelect = (id) => {
    setActiveStickerIndex(id);
    // You could add more functionality here if needed
  };

  const updateStickerScale = (id, scale) => {
    updateSticker(id, { scale });
  };

  // Improved download function that properly includes text and stickers
  const downloadImage = useCallback(async () => {
    if (frameRef.current) {
      try {
        // Configure html-to-image with options to ensure all elements are captured
        const options = {
          quality: 1.0,
          pixelRatio: 2, // Higher pixel ratio for better quality
          skipAutoScale: true,
          style: {
            // Ensure all elements are visible during capture
            transform: 'none',
            opacity: '1'
          },
          // Function to make sure elements are properly included in the capture
          filter: (node) => {
            // Keep all elements for capture
            return true;
          }
        };
        
        const dataUrl = await toPng(frameRef.current, options);
        const link = document.createElement('a');
        link.download = `myts-photobooth-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Error downloading image:', err);
        alert('Error creating image. Please try again.');
      }
    }
  }, []);

  const formatDate = () => {
    const date = new Date();
    const day = date.getDate();
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formattedDate = formatDate();

  const getRemainingChars = (id) => {
    const title = titles.find(t => t.id === id);
    return title ? MAX_TEXT_LENGTH - title.text.length : MAX_TEXT_LENGTH;
  };

  return (
    <div className="flex flex-col items-center relative">
      {/* Back button */}
      <div className="mb-4">
        <Button
          color="light"
          size="sm"
          onClick={() => setStep(3)} // Go back to LayoutSelector (step 3)
          className="flex items-center gap-2"
        >
          <span className="flex items-center">
            <ChevronLeft size={16} />
            Back to Layout
          </span>
        </Button>
      </div>

      <div className="relative w-full max-w-md">
        {/* The main frame container */}
        <div 
          ref={frameRef}
          className="bg-black rounded-xl p-6 shadow-lg relative overflow-hidden"
          style={{ backgroundColor: frameColor }}
          onClick={() => {
            setActiveTextId(null);
            setActiveStickerIndex(null);
          }}
        >
          {/* Photo layout */}
          <div className={`flex ${getLayoutStyle()} gap-6`}>
            {photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Photo ${index + 1}`}
                className="rounded-lg w-full h-full object-cover"
              />
            ))}
          </div>
          
          {/* Date and studio name */}
          <div className="text-center mt-6 space-y-3">
            <p style={{ color: textColor }}>{formattedDate}</p>
            <p className="text-sm" style={{ color: textColor }}>Myts Studio</p>
          </div>

          {/* Draggable text elements */}
          {titles.map((title) => (
            title.text && (
              <Draggable
                key={title.id}
                position={title.position}
                onStop={(e, data) => handleDrag(title.id, e, data)}
                bounds="parent"
                handle=".drag-handle"
              >
                <div 
                  className={`absolute cursor-move ${activeTextId === title.id ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTextClick(title.id);
                  }}
                >
                  <div className="drag-handle relative">
                    <h2 
                      className={`${title.font}`}
                      style={{ 
                        fontSize: `${title.fontSize}px`,
                        color: textColor
                      }}
                    >
                      {title.text}
                    </h2>
                  </div>
                </div>
              </Draggable>
            )
          ))}

          {/* Draggable stickers */}
          {stickers.map((sticker) => (
            <Draggable
              key={sticker.id}
              position={sticker.position}
              onStop={(e, data) => handleStickerDrag(sticker.id, e, data)}
              bounds="parent"
            >
              <div 
                className={`absolute cursor-move ${activeStickerIndex === sticker.id ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStickerSelect(sticker.id);
                }}
              >
                <img
                  src={sticker.url}
                  alt="Sticker"
                  className="object-contain"
                  style={{
                    width: `${48 * sticker.scale}px`,
                    height: `${48 * sticker.scale}px`,
                    transform: `rotate(${sticker.rotation}deg)`,
                  }}
                />
                {/* Only show the X button when this sticker is active/selected */}
                {activeStickerIndex === sticker.id && (
                  <button
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSticker(sticker.id);
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            </Draggable>
          ))}
        </div>
      </div>

      {/* Settings button */}
      <div className="fixed bottom-6 right-6 z-10">
        <button
          onClick={toggleSidebar}
          className="bg-neutral-600 hover:bg-neutral-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center"
          aria-label={sidebarOpen ? "Close settings" : "Open settings"}
        >
          {sidebarOpen ? <X size={24} /> : <Settings size={24} />}
        </button>
      </div>

      {/* Download button */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          gradientDuoTone="purpleToBlue"
          className="mt-6 lg:px-5 lg:py-3 font-semibold"
          onClick={downloadImage}
        >
          <Download size={20} className="mr-2" />
          Download Image
        </Button>
        <Button 
          gradientDuoTone="purpleToBlue"
          className="mt-6 lg:px-5 lg:py-3 font-semibold"
          onClick={() => window.location.reload()}
        >
          <RefreshCw size={20} className="mr-2" />
            Retake Photos
        </Button>
      </div>

      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full bg-gray-800 shadow-xl transition-transform duration-300 ease-in-out z-20 w-72 overflow-y-auto ${
          sidebarOpen ? 'transform-none' : 'translate-x-full'
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Customizer</h2>
          <button 
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar tabs */}
        <div className="flex border-b border-gray-700">
          <button
            className={`flex-1 py-3 text-sm font-medium ${
              activeSidebarTab === 'frame' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400'
            }`}
            onClick={() => setActiveSidebarTab('frame')}
          >
            <Image size={16} className="inline mr-1" />
            Frame
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium ${
              activeSidebarTab === 'text' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400'
            }`}
            onClick={() => setActiveSidebarTab('text')}
          >
            <Type size={16} className="inline mr-1" />
            Text
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium ${
              activeSidebarTab === 'stickers' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400'
            }`}
            onClick={() => setActiveSidebarTab('stickers')}
          >
            <Sticker size={16} className="inline mr-1" />
            Stickers
          </button>
        </div>

        {/* Sidebar content */}
        <div className="p-4">
          {/* Frame tab content */}
          {activeSidebarTab === 'frame' && (
            <div>
              <h3 className="flex items-center gap-2 text-lg font-medium mb-4 text-white">
                <Image size={20} />
                Frame Color
              </h3>
              <HexColorPicker color={frameColor} onChange={setFrameColor} className="w-full mb-4" />
              
              <h3 className="flex items-center gap-2 text-lg font-medium mb-4 text-white mt-6">
                <Type size={20} />
                Text Color
              </h3>
              <HexColorPicker color={textColor} onChange={setTextColor} className="w-full mb-4" />
            </div>
          )}

          {/* Text tab content */}
          {activeSidebarTab === 'text' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 text-lg font-medium text-white">
                  <Type size={20} />
                  Text Elements
                </h3>
                <Button color="purple" size="sm" onClick={addNewTitle}>
                  Add Text
                </Button>
              </div>

              {activeTextId && (
                <div className="bg-gray-700 rounded-lg p-4 mb-4">
                  <h4 className="text-white font-medium mb-3">Edit Selected Text</h4>
                  
                  <div className="mb-3">
                    <Label htmlFor="selected-text" className="block mb-2 text-white flex justify-between">
                      <span>Text Content</span>
                      <span className="text-sm text-gray-400">
                        {getRemainingChars(activeTextId)} characters remaining
                      </span>
                    </Label>
                    <TextInput
                      id="selected-text"
                      placeholder="Add your text here (max 30 chars)"
                      value={titles.find(t => t.id === activeTextId)?.text || ''}
                      onChange={(e) => updateTitleText(activeTextId, e.target.value)}
                      maxLength={MAX_TEXT_LENGTH}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <Label htmlFor="selected-font" className="block mb-2 text-white">
                      Font Style
                    </Label>
                    <Select
                      id="selected-font"
                      value={titles.find(t => t.id === activeTextId)?.font || 'font-sans'}
                      onChange={(e) => updateTitleFont(activeTextId, e.target.value)}
                    >
                      {fontOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-white flex items-center">
                        <Maximize size={14} className="mr-2" />
                        Font Size
                      </Label>
                      <span className="text-white">
                        {titles.find(t => t.id === activeTextId)?.fontSize || 24}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="72"
                      value={titles.find(t => t.id === activeTextId)?.fontSize || 24}
                      onChange={(e) => updateTitleFontSize(activeTextId, parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <Button 
                    color="failure" 
                    size="sm"
                    onClick={() => removeTitle(activeTextId)}
                    className="mt-2"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Remove Text
                  </Button>
                </div>
              )}

              <div className="max-h-64 overflow-y-auto">
                <h4 className="text-white font-medium mb-2">All Text Elements</h4>
                {titles.length === 0 ? (
                  <p className="text-gray-400 text-sm">No text elements added yet.</p>
                ) : (
                  titles.map((title) => (
                    <div 
                      key={title.id} 
                      className={`mb-2 p-2 rounded-lg cursor-pointer ${
                        activeTextId === title.id ? 'bg-purple-700' : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      onClick={() => handleTextClick(title.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Move size={14} className="mr-2 text-gray-400" />
                          <span className="text-white truncate max-w-36">
                            {title.text || `Text ${title.id}`}
                          </span>
                        </div>
                        <ChevronRight size={16} className="text-gray-400" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Stickers tab content */}
          {activeSidebarTab === 'stickers' && (
            <div>
              <div className="mb-4">
                <h3 className="flex items-center gap-2 text-lg font-medium text-white mb-4">
                  <Sticker size={20} />
                  Stickers
                </h3>
                
                {/* Sticker grid instead of button */}
                <div className="grid grid-cols-3 gap-3">
                  {availableStickers.map((stickerUrl, index) => (
                    <div 
                      key={index}
                      className="bg-gray-700 rounded-lg p-2 cursor-pointer hover:bg-gray-600 transition-colors"
                      onClick={() => handleStickerClick(index)}
                    >
                      <img
                        src={stickerUrl}
                        alt={`Sticker ${index + 1}`}
                        className="w-full h-16 object-contain mx-auto"
                      />
                    </div>
                  ))}
                  {/* Add placeholder stickers to fill the grid */}
                  {[...Array(9 - availableStickers.length)].map((_, index) => (
                    <div 
                      key={`placeholder-${index}`}
                      className="bg-gray-700 rounded-lg p-2 flex items-center justify-center"
                    >
                      <div className="w-12 h-12 flex items-center justify-center">
                        <div className="text-gray-500">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sticker editing options */}
              {activeStickerIndex !== null && (
                <div className="bg-gray-700 rounded-lg p-4 mb-4">
                  <h4 className="text-white font-medium mb-3">Edit Selected Sticker</h4>
                  
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-white flex items-center">
                        <Maximize size={14} className="mr-2" />
                        Sticker Size
                      </Label>
                      <span className="text-white">
                        {stickers.find(s => s.id === activeStickerIndex)?.scale.toFixed(1) || '1.0'}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={stickers.find(s => s.id === activeStickerIndex)?.scale || 1}
                      onChange={(e) => updateStickerScale(activeStickerIndex, parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <Button 
                    color="failure" 
                    size="sm"
                    onClick={() => removeSticker(activeStickerIndex)}
                    className="mt-2"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Remove Sticker
                  </Button>
                </div>
              )}

              {stickers.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-white font-medium mb-2">Added Stickers</h4>
                  <p className="text-gray-400 text-sm">
                    Drag stickers to position them. Click to select or × to remove.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FrameCustomizer;
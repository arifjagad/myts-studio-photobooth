import React, { useCallback, useRef, useState } from 'react';
import { 
  Download, Image, Sticker, Type, Plus, Trash2, Move, 
  RotateCw, Maximize, Settings, X, ChevronRight 
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
  const [activeSidebarTab, setActiveSidebarTab] = useState('frame'); // 'frame', 'text', 'stickers'
  const MAX_TEXT_LENGTH = 30; // Maximum text length of 30 characters
  
  const {
    photos,
    selectedLayout,
    frameColor,
    setFrameColor,
  } = usePhotoboothStore();

  // Available font options
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
      fontSize: 24,
      rotation: 0
    };
    setTitles([...titles, newTitle]);
    setNextId(nextId + 1);
    setActiveTextId(newTitle.id);
    setSidebarOpen(true);
    setActiveSidebarTab('text');
  };

  const updateTitleText = (id, newText) => {
    // Limit text to MAX_TEXT_LENGTH characters
    const limitedText = newText.slice(0, MAX_TEXT_LENGTH);
    const newTitles = titles.map(title => 
      title.id === id ? { ...title, text: limitedText } : title
    );
    setTitles(newTitles);
  };

  const updateTitleFont = (id, newFont) => {
    const newTitles = titles.map(title => 
      title.id === id ? { ...title, font: newFont } : title
    );
    setTitles(newTitles);
  };

  const updateTitleFontSize = (id, newSize) => {
    const newTitles = titles.map(title => 
      title.id === id ? { ...title, fontSize: newSize } : title
    );
    setTitles(newTitles);
  };

  const updateTitleRotation = (id, newRotation) => {
    // Ensure rotation is between 0 and 359
    const normalizedRotation = ((newRotation % 360) + 360) % 360;
    
    const newTitles = titles.map(title => 
      title.id === id ? { ...title, rotation: normalizedRotation } : title
    );
    setTitles(newTitles);
  };

  // Fixed function to properly rotate text elements
  const rotateTextElement = (id, increment) => {
    const title = titles.find(t => t.id === id);
    if (title) {
      const currentRotation = title.rotation || 0;
      const newRotation = (currentRotation + increment + 360) % 360;
      
      // Create a new titles array with the updated rotation
      const newTitles = titles.map(t => 
        t.id === id ? { ...t, rotation: newRotation } : t
      );
      
      // Update state with the new titles array
      setTitles(newTitles);
    }
  };

  const removeTitle = (id) => {
    const newTitles = titles.filter(title => title.id !== id);
    setTitles(newTitles);
    if (activeTextId === id) {
      setActiveTextId(null);
    }
  };

  const handleDrag = (id, e, data) => {
    const newTitles = titles.map(title => 
      title.id === id ? { ...title, position: { x: data.x, y: data.y } } : title
    );
    setTitles(newTitles);
  };

  const handleTextClick = (id) => {
    setActiveTextId(id);
    setSidebarOpen(true);
    setActiveSidebarTab('text');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const downloadImage = useCallback(async () => {
    if (frameRef.current) {
      try {
        const dataUrl = await toPng(frameRef.current, { quality: 1.0 });
        const link = document.createElement('a');
        link.download = `myts-photobooth-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Error downloading image:', err);
      }
    }
  }, []);

  // Format date as "23 Maret 2025"
  const formatDate = () => {
    const date = new Date();
    const day = date.getDate();
    
    // Array of month names in Indonesian
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  };

  // Get formatted date string
  const formattedDate = formatDate();

  // Calculate remaining characters for text input
  const getRemainingChars = (id) => {
    const title = titles.find(t => t.id === id);
    if (title) {
      return MAX_TEXT_LENGTH - title.text.length;
    }
    return MAX_TEXT_LENGTH;
  };

  return (
    <div className="flex flex-col items-center relative">
      {/* Frame display section */}
      <div 
        ref={frameRef}
        className="bg-black rounded-xl p-6 shadow-lg w-full max-w-md mx-auto relative"
        style={{ backgroundColor: frameColor }}
        onClick={() => setActiveTextId(null)} // Deselect when clicking empty space
      >
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
                style={{
                  transform: `rotate(${title.rotation}deg)`,
                }}
              >
                <div className="drag-handle relative">
                  <h2 
                    className={`${title.font} text-white`}
                    style={{ fontSize: `${title.fontSize}px` }}
                  >
                    {title.text}
                  </h2>
                  
                  {/* Controls that appear when text is selected */}
                  {activeTextId === title.id && (
                    <div className="absolute top-0 right-0 translate-x-full -translate-y-1/2 bg-gray-800 p-2 rounded-lg shadow-lg flex gap-2">
                      <button 
                        className="text-white bg-purple-600 p-1 rounded hover:bg-purple-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          rotateTextElement(title.id, 15);
                        }}
                        aria-label="Rotate text"
                      >
                        <RotateCw size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Draggable>
          )
        ))}
        
        {/* Fixed elements at the bottom */}
        <div className="text-center mt-6 space-y-3">
          <p className="text-gray-400">{formattedDate}</p>
          <p className="text-sm text-gray-500">Myts Studio</p>
        </div>
      </div>

      {/* Settings button (bottom right corner) */}
      <div className="fixed bottom-6 right-6 z-10">
        <button
          onClick={toggleSidebar}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center"
          aria-label={sidebarOpen ? "Close settings" : "Open settings"}
        >
          {sidebarOpen ? <X size={24} /> : <Settings size={24} />}
        </button>
      </div>

      {/* Download button under the frame */}
      <Button 
        gradientDuoTone="purpleToBlue"
        className="mt-6 px-6 py-3 font-semibold"
        onClick={downloadImage}
      >
        <Download size={20} className="mr-2" />
        Download Image
      </Button>

      {/* Sidebar - only visible when settings button is clicked */}
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

        {/* Tab content */}
        <div className="p-4">
          {/* Frame tab */}
          {activeSidebarTab === 'frame' && (
            <div>
              <h3 className="flex items-center gap-2 text-lg font-medium mb-4 text-white">
                <Image size={20} />
                Frame Color
              </h3>
              <HexColorPicker color={frameColor} onChange={setFrameColor} className="w-full mb-4" />
            </div>
          )}

          {/* Text tab */}
          {activeSidebarTab === 'text' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 text-lg font-medium text-white">
                  <Type size={20} />
                  Text Elements
                </h3>
                <Button color="purple" size="sm" onClick={addNewTitle}>
                  <Plus size={16} className="mr-1" />
                  Add
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
                  
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-white flex items-center">
                        <RotateCw size={14} className="mr-2" />
                        Rotation
                      </Label>
                      <span className="text-white">
                        {titles.find(t => t.id === activeTextId)?.rotation || 0}°
                      </span>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="range"
                        min="0"
                        max="359"
                        value={titles.find(t => t.id === activeTextId)?.rotation || 0}
                        onChange={(e) => updateTitleRotation(activeTextId, parseInt(e.target.value))}
                        className="w-full mr-2"
                      />
                      <div className="flex gap-1">
                        <button
                          className="bg-purple-600 hover:bg-purple-700 text-white p-1 rounded"
                          onClick={() => rotateTextElement(activeTextId, -15)}
                          aria-label="Rotate counter-clockwise"
                        >
                          <RotateCw size={16} className="transform -scale-x-100" />
                        </button>
                        <button
                          className="bg-purple-600 hover:bg-purple-700 text-white p-1 rounded"
                          onClick={() => rotateTextElement(activeTextId, 15)}
                          aria-label="Rotate clockwise"
                        >
                          <RotateCw size={16} />
                        </button>
                      </div>
                    </div>
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

          {/* Stickers tab */}
          {activeSidebarTab === 'stickers' && (
            <div>
              <h3 className="flex items-center gap-2 text-lg font-medium mb-4 text-white">
                <Sticker size={20} />
                Stickers
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg bg-gray-700 hover:bg-gray-600 cursor-pointer flex items-center justify-center"
                  >
                    <Sticker size={24} className="text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FrameCustomizer;
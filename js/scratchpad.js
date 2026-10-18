// 互動草稿紙與計算畫布功能 (Scratchpad / Canvas Drawing)
class ScratchpadManager {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.drawing = false;
    this.mode = 'pen'; // 'pen' | 'highlighter' | 'eraser'
    this.color = '#3b82f6';
    this.size = 3;
    this.history = [];
    this.isOpen = false;
  }

  init() {
    this.modal = document.getElementById('scratchpad-modal');
    this.canvas = document.getElementById('scratchpad-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.resizeCanvas();
    window.addEventListener('resize', () => {
      if (this.isOpen) this.resizeCanvas(true);
    });

    // 事件監聽
    this.setupListeners();
  }

  resizeCanvas(preserveContent = false) {
    if (!this.canvas) return;
    let tempImg = null;
    if (preserveContent && this.canvas.width > 0 && this.canvas.height > 0) {
      tempImg = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    if (tempImg && preserveContent) {
      this.ctx.putImageData(tempImg, 0, 0);
    } else {
      this.drawGridBackground();
    }
  }

  drawGridBackground() {
    if (!this.ctx) return;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 畫方格底線
    this.ctx.strokeStyle = '#f1f5f9';
    this.ctx.lineWidth = 1;
    const gridSize = 24;
    for (let x = 0; x < this.canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  setupListeners() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const startDraw = (e) => {
      e.preventDefault();
      this.drawing = true;
      const pos = getPos(e);
      this.lastPos = pos;
      this.saveState();
      this.draw(pos.x, pos.y, false);
    };

    const moveDraw = (e) => {
      if (!this.drawing) return;
      e.preventDefault();
      const pos = getPos(e);
      this.draw(pos.x, pos.y, true);
      this.lastPos = pos;
    };

    const endDraw = (e) => {
      this.drawing = false;
      this.ctx.beginPath();
    };

    // 滑鼠事件
    this.canvas.addEventListener('mousedown', startDraw);
    this.canvas.addEventListener('mousemove', moveDraw);
    window.addEventListener('mouseup', endDraw);

    // 觸控事件
    this.canvas.addEventListener('touchstart', startDraw, { passive: false });
    this.canvas.addEventListener('touchmove', moveDraw, { passive: false });
    window.addEventListener('touchend', endDraw);
  }

  draw(x, y, isMoving) {
    if (!this.ctx) return;
    this.ctx.beginPath();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    if (this.mode === 'eraser') {
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 28;
    } else if (this.mode === 'highlighter') {
      this.ctx.strokeStyle = 'rgba(253, 224, 71, 0.4)';
      this.ctx.lineWidth = 18;
    } else {
      this.ctx.strokeStyle = this.color;
      this.ctx.lineWidth = this.size;
    }

    if (isMoving && this.lastPos) {
      this.ctx.moveTo(this.lastPos.x, this.lastPos.y);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
    } else {
      this.ctx.arc(x, y, (this.ctx.lineWidth || 2) / 2, 0, Math.PI * 2);
      this.ctx.fillStyle = this.ctx.strokeStyle;
      this.ctx.fill();
    }
  }

  saveState() {
    if (this.history.length > 20) this.history.shift();
    this.history.push(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));
  }

  undo() {
    if (this.history.length > 0) {
      const prevState = this.history.pop();
      this.ctx.putImageData(prevState, 0, 0);
    } else {
      this.clear();
    }
  }

  clear() {
    if (!this.ctx) return;
    this.saveState();
    this.drawGridBackground();
  }

  setMode(mode) {
    this.mode = mode;
  }

  setColor(color) {
    this.color = color;
    this.mode = 'pen';
  }

  toggle() {
    this.isOpen = !this.isOpen;
    if (this.modal) {
      if (this.isOpen) {
        this.modal.classList.remove('hidden');
        setTimeout(() => this.resizeCanvas(false), 50);
      } else {
        this.modal.classList.add('hidden');
      }
    }
  }

  close() {
    this.isOpen = false;
    if (this.modal) this.modal.classList.add('hidden');
  }
}

window.scratchpad = new ScratchpadManager();

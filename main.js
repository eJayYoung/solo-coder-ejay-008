class FlightRadar {
    constructor() {
        this.canvas = document.getElementById('mapCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.flights = [];
        this.selectedFlight = null;
        this.timeScale = 1;
        this.filterHighAltitude = false;
        this.infoPanel = document.getElementById('infoPanel');
        
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        this.init();
    }

    init() {
        this.resizeCanvas();
        this.generateFlights();
        this.setupEventListeners();
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    generateFlights() {
        const airlines = ['CA', 'MU', 'CZ', 'HU', 'ZH', 'SC', '3U', 'FM', 'HO', 'BK'];
        const numFlights = 20;
        
        for (let i = 0; i < numFlights; i++) {
            const flight = {
                id: i,
                callSign: airlines[Math.floor(Math.random() * airlines.length)] + String(Math.floor(Math.random() * 9000) + 1000),
                lat: -90 + Math.random() * 180,
                lng: -180 + Math.random() * 360,
                altitude: 5000 + Math.random() * 10000,
                speed: 700 + Math.random() * 500,
                heading: Math.random() * 360
            };
            this.flights.push(flight);
        }
    }

    latLngToXY(lat, lng) {
        const baseX = ((lng + 180) / 360) * this.canvas.width;
        const latRad = (lat * Math.PI) / 180;
        const mercator = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
        const baseY = (0.5 - mercator / (2 * Math.PI)) * this.canvas.height;
        
        const x = baseX * this.scale + this.offsetX;
        const y = baseY * this.scale + this.offsetY;
        
        return { x, y };
    }

    screenToLatLng(screenX, screenY) {
        const baseX = (screenX - this.offsetX) / this.scale;
        const baseY = (screenY - this.offsetY) / this.scale;
        
        const lng = (baseX / this.canvas.width) * 360 - 180;
        const mercator = (0.5 - baseY / this.canvas.height) * 2 * Math.PI;
        const latRad = 2 * Math.atan(Math.exp(mercator)) - Math.PI / 2;
        const lat = (latRad * 180) / Math.PI;
        
        return { lat, lng };
    }

    drawMap() {
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.save();
        this.ctx.scale(this.scale, this.scale);
        this.ctx.translate(this.offsetX / this.scale, this.offsetY / this.scale);
        
        this.drawGrid();
        this.drawContinents();
        
        this.ctx.restore();
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
        this.ctx.lineWidth = 1;

        const latStep = 30;
        for (let lat = -90; lat <= 90; lat += latStep) {
            const { y } = this.latLngToCanvas(lat, 0);
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }

        const lngStep = 30;
        for (let lng = -180; lng <= 180; lng += lngStep) {
            const { x } = this.latLngToCanvas(lng, 0);
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        this.ctx.fillStyle = 'rgba(0, 212, 255, 0.4)';
        this.ctx.font = '10px Arial';
        for (let lat = -60; lat <= 60; lat += 30) {
            const { y } = this.latLngToCanvas(0, lat);
            this.ctx.fillText(lat + '°', 5, y + 4);
        }
        for (let lng = -150; lng <= 150; lng += 30) {
            const { x } = this.latLngToCanvas(lng, 0);
            this.ctx.fillText(lng + '°', x - 15, 15);
        }
    }

    latLngToCanvas(lng, lat) {
        const x = ((lng + 180) / 360) * this.canvas.width;
        const latRad = (lat * Math.PI) / 180;
        const mercator = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
        const y = (0.5 - mercator / (2 * Math.PI)) * this.canvas.height;
        return { x, y };
    }

    drawContinents() {
        this.ctx.fillStyle = 'rgba(0, 150, 100, 0.6)';
        
        this.drawNorthAmerica();
        this.drawSouthAmerica();
        this.drawEurope();
        this.drawAfrica();
        this.drawAsia();
        this.drawAustralia();
    }

    drawNorthAmerica() {
        this.ctx.beginPath();
        this.ctx.moveTo(...this.getCanvasPoint(-170, 70));
        this.ctx.lineTo(...this.getCanvasPoint(-140, 75));
        this.ctx.lineTo(...this.getCanvasPoint(-100, 50));
        this.ctx.lineTo(...this.getCanvasPoint(-80, 30));
        this.ctx.lineTo(...this.getCanvasPoint(-100, 20));
        this.ctx.lineTo(...this.getCanvasPoint(-120, 25));
        this.ctx.lineTo(...this.getCanvasPoint(-140, 50));
        this.ctx.lineTo(...this.getCanvasPoint(-160, 60));
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawSouthAmerica() {
        this.ctx.beginPath();
        this.ctx.moveTo(...this.getCanvasPoint(-80, 15));
        this.ctx.lineTo(...this.getCanvasPoint(-60, 10));
        this.ctx.lineTo(...this.getCanvasPoint(-55, -10));
        this.ctx.lineTo(...this.getCanvasPoint(-60, -30));
        this.ctx.lineTo(...this.getCanvasPoint(-70, -50));
        this.ctx.lineTo(...this.getCanvasPoint(-80, -35));
        this.ctx.lineTo(...this.getCanvasPoint(-85, -20));
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawEurope() {
        this.ctx.beginPath();
        this.ctx.moveTo(...this.getCanvasPoint(-10, 60));
        this.ctx.lineTo(...this.getCanvasPoint(20, 65));
        this.ctx.lineTo(...this.getCanvasPoint(30, 60));
        this.ctx.lineTo(...this.getCanvasPoint(30, 45));
        this.ctx.lineTo(...this.getCanvasPoint(20, 40));
        this.ctx.lineTo(...this.getCanvasPoint(5, 45));
        this.ctx.lineTo(...this.getCanvasPoint(-5, 50));
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawAfrica() {
        this.ctx.beginPath();
        this.ctx.moveTo(...this.getCanvasPoint(-20, 35));
        this.ctx.lineTo(...this.getCanvasPoint(10, 35));
        this.ctx.lineTo(...this.getCanvasPoint(20, 20));
        this.ctx.lineTo(...this.getCanvasPoint(30, 10));
        this.ctx.lineTo(...this.getCanvasPoint(35, -10));
        this.ctx.lineTo(...this.getCanvasPoint(25, -35));
        this.ctx.lineTo(...this.getCanvasPoint(10, -35));
        this.ctx.lineTo(...this.getCanvasPoint(-10, -30));
        this.ctx.lineTo(...this.getCanvasPoint(-15, -10));
        this.ctx.lineTo(...this.getCanvasPoint(-20, 10));
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawAsia() {
        this.ctx.beginPath();
        this.ctx.moveTo(...this.getCanvasPoint(30, 75));
        this.ctx.lineTo(...this.getCanvasPoint(180, 70));
        this.ctx.lineTo(...this.getCanvasPoint(180, 40));
        this.ctx.lineTo(...this.getCanvasPoint(140, 35));
        this.ctx.lineTo(...this.getCanvasPoint(120, 20));
        this.ctx.lineTo(...this.getCanvasPoint(95, 10));
        this.ctx.lineTo(...this.getCanvasPoint(70, 30));
        this.ctx.lineTo(...this.getCanvasPoint(50, 45));
        this.ctx.lineTo(...this.getCanvasPoint(30, 55));
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawAustralia() {
        this.ctx.beginPath();
        this.ctx.moveTo(...this.getCanvasPoint(110, -10));
        this.ctx.lineTo(...this.getCanvasPoint(155, -10));
        this.ctx.lineTo(...this.getCanvasPoint(155, -35));
        this.ctx.lineTo(...this.getCanvasPoint(130, -45));
        this.ctx.lineTo(...this.getCanvasPoint(115, -35));
        this.ctx.closePath();
        this.ctx.fill();
    }

    getCanvasPoint(lng, lat) {
        const { x, y } = this.latLngToCanvas(lng, lat);
        return [x, y];
    }

    drawFlights() {
        for (const flight of this.flights) {
            if (this.filterHighAltitude && flight.altitude <= 8000) continue;
            
            const { x, y } = this.latLngToXY(flight.lat, flight.lng);
            
            if (x < -50 || x > this.canvas.width + 50 || y < -50 || y > this.canvas.height + 50) {
                continue;
            }
            
            const isSelected = this.selectedFlight && this.selectedFlight.id === flight.id;
            
            this.drawPlane(x, y, flight.heading, isSelected);
            
            if (isSelected) {
                this.updateInfoPanel(x, y, flight);
            }
        }
    }

    drawPlane(x, y, heading, isSelected) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate((heading - 90) * Math.PI / 180);
        
        const size = isSelected ? 20 : 15;
        const color = isSelected ? '#ff4444' : '#00d4ff';
        
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(size, 0);
        this.ctx.lineTo(-size, -size * 0.6);
        this.ctx.lineTo(-size * 0.5, 0);
        this.ctx.lineTo(-size, size * 0.6);
        this.ctx.closePath();
        this.ctx.fill();
        
        if (isSelected) {
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, size + 5, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }

    updateFlights(deltaTime) {
        const timeFactor = deltaTime * this.timeScale * 0.001;
        const visualSpeedMultiplier = 100;
        
        for (const flight of this.flights) {
            const speedKmPerMs = flight.speed / 3600;
            const distance = speedKmPerMs * 1000 * timeFactor * visualSpeedMultiplier;
            const earthRadius = 6371000;
            const angularDistance = distance / earthRadius;
            
            const latRad = (flight.lat * Math.PI) / 180;
            const lngRad = (flight.lng * Math.PI) / 180;
            const headingRad = (flight.heading * Math.PI) / 180;
            
            const newLatRad = Math.asin(
                Math.sin(latRad) * Math.cos(angularDistance) +
                Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(headingRad)
            );
            
            const newLngRad = lngRad + Math.atan2(
                Math.sin(headingRad) * Math.sin(angularDistance) * Math.cos(latRad),
                Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(newLatRad)
            );
            
            flight.lat = (newLatRad * 180) / Math.PI;
            flight.lng = (newLngRad * 180) / Math.PI;
            
            if (flight.lng > 180) flight.lng -= 360;
            if (flight.lng < -180) flight.lng += 360;
            
            if (flight.altitude < 15000 && Math.random() < 0.001) {
                flight.altitude += 100;
            } else if (flight.altitude > 5000 && Math.random() < 0.001) {
                flight.altitude -= 100;
            }
            
            flight.speed += (Math.random() - 0.5) * 10;
            flight.speed = Math.max(600, Math.min(1200, flight.speed));
            
            flight.heading += (Math.random() - 0.5) * 2;
            if (flight.heading < 0) flight.heading += 360;
            if (flight.heading > 360) flight.heading -= 360;
        }
    }

    updateInfoPanel(x, y, flight) {
        this.infoPanel.style.display = 'block';
        
        let panelX = x + 20;
        let panelY = y - this.infoPanel.offsetHeight / 2;
        
        if (panelX + this.infoPanel.offsetWidth > this.canvas.width) {
            panelX = x - this.infoPanel.offsetWidth - 20;
        }
        if (panelY < 60) panelY = 60;
        if (panelY + this.infoPanel.offsetHeight > this.canvas.height) {
            panelY = this.canvas.height - this.infoPanel.offsetHeight - 10;
        }
        
        this.infoPanel.style.left = panelX + 'px';
        this.infoPanel.style.top = panelY + 'px';
        
        document.getElementById('flightNumber').textContent = flight.callSign;
        document.getElementById('altitude').textContent = flight.altitude.toFixed(0) + ' m';
        document.getElementById('speed').textContent = flight.speed.toFixed(0) + ' km/h';
        document.getElementById('heading').textContent = flight.heading.toFixed(0) + '°';
        document.getElementById('latitude').textContent = flight.lat.toFixed(4) + '°';
        document.getElementById('longitude').textContent = flight.lng.toFixed(4) + '°';
    }

    closeInfoPanel() {
        this.infoPanel.style.display = 'none';
        this.selectedFlight = null;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const deltaX = e.clientX - this.lastMouseX;
                const deltaY = e.clientY - this.lastMouseY;
                
                this.offsetX += deltaX;
                this.offsetY += deltaY;
                
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
        });
        
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            const newScale = Math.max(0.5, Math.min(10, this.scale * zoomFactor));
            
            const worldX = (mouseX - this.offsetX) / this.scale;
            const worldY = (mouseY - this.offsetY) / this.scale;
            
            this.scale = newScale;
            this.offsetX = mouseX - worldX * this.scale;
            this.offsetY = mouseY - worldY * this.scale;
        }, { passive: false });
        
        this.canvas.addEventListener('click', (e) => {
            if (this.isDragging) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            let clickedFlight = null;
            
            for (const flight of this.flights) {
                if (this.filterHighAltitude && flight.altitude <= 8000) continue;
                
                const { x, y } = this.latLngToXY(flight.lat, flight.lng);
                const distance = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2);
                
                if (distance < 20) {
                    clickedFlight = flight;
                    break;
                }
            }
            
            if (clickedFlight) {
                this.selectedFlight = clickedFlight;
            } else {
                this.closeInfoPanel();
            }
        });
        
        document.getElementById('closePanel').addEventListener('click', () => {
            this.closeInfoPanel();
        });
        
        document.getElementById('highAltitudeFilter').addEventListener('change', (e) => {
            this.filterHighAltitude = e.target.checked;
            if (this.selectedFlight && this.selectedFlight.altitude <= 8000) {
                this.closeInfoPanel();
            }
        });
        
        document.getElementById('speedUp').addEventListener('click', () => {
            this.timeScale = Math.min(10, this.timeScale + 1);
            document.getElementById('speedDisplay').textContent = this.timeScale + 'x';
        });
        
        document.getElementById('speedDown').addEventListener('click', () => {
            this.timeScale = Math.max(0.1, this.timeScale - 0.5);
            document.getElementById('speedDisplay').textContent = this.timeScale + 'x';
        });
    }

    animate() {
        let lastTime = performance.now();
        
        const loop = (currentTime) => {
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;
            
            this.drawMap();
            this.updateFlights(deltaTime);
            this.drawFlights();
            
            requestAnimationFrame(loop);
        };
        
        requestAnimationFrame(loop);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FlightRadar();
});
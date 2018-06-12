/**
 * Canvas Wrapper object to handle pixel level drawing on the HTML5 Canvas as well as manage the canvas
 * Automatically deploys a canvas to the body (for now)
 * 
 * (Now in ES6)
 * 
 * @author  James Wake (SparkX120)
 * @version 0.0.6 (2017/12)
 * @license MIT
 */
export default class Canvas2D {
	constructor(config){
		//Create the Canvas and Deploy it
		this.container = document.createElement('div');
		this.canvas = document.createElement('canvas');
		this.bufferedImage = document.createElement('canvas');

		//Get Supersampling and Style configurations
		if(config && config.supersampling)
			this.supersampling = config.supersampling;
		else
			this.supersampling = 1.0;

		if(config.canvasStyle){
			for(let i in config.canvasStyle){
				this.canvas.style[i] = config.canvasStyle[i];
			}
		}
		if(config.containerStyle){
			for(let i in config.containerStyle){
				this.container.style[i] = config.containerStyle[i];
			}
		}
		else{
			this.container.style.margin   = "0%";
			this.container.style.width    = "100vw";
			this.container.style.height   = "100vh";
			this.container.style.position = "relative";
		}
		
		//Setup Contexts
		this.context = this.canvas.getContext('2d');
		this.bufferedContext = this.bufferedImage.getContext('2d')

		//Compose the container and put into the document
		this.container.appendChild(this.canvas);
		document.body.appendChild(this.container);

		//Positioning and Scaling
		this.rect = this.container.getBoundingClientRect();
		window.addEventListener('resize', (event) => {
			this.setSupersampling(this.supersampling);
			if(this.resizeCB){
				this.resizeCB();
			}
		});
		window.addEventListener('load', (event) => {
			this.setSupersampling(this.supersampling);
			if(this.resizeCB){
				this.resizeCB();
			}
		});
		this.canvas.width = this.rect.width;
		this.canvas.height = this.rect.height;
		this.width = this.rect.width;
		this.height = this.rect.height;
		
		//Persistant Pixel Image Data Object
		this.pixelImageData = this.context.createImageData(1,1);
		this.buffer = this.context.createImageData(this.width, this.height);
	}
	
	/**
	 * Set a supersampling factor for the buffered canvas (access super sample width and height via getWidth and getHeight)
	 * @param {*} supersampling - The supersampling factor to use
	 */
    setSupersampling(supersampling){
		//Compute Dimensions to use
        this.supersampling = supersampling;
        this.rect = this.canvas.getBoundingClientRect();
        this.canvas.width = this.rect.width;
		this.canvas.height = this.rect.height;
        this.width = this.rect.width;
		this.height = this.rect.height;
		this.context.scale(1/supersampling,1/supersampling);
		
		//Setup the supersampled ArrayBuffer
		this.buffer = this.context.createImageData(this.getWidth(), this.getHeight());
		this.bufferedImage.width = this.rect.width*supersampling;
		this.bufferedImage.height = this.rect.height*supersampling;
        return this;
    }
	
	/**
	 * Get the width of canvas with supersampling
	 * @returns the width with supersampling
	 */
    getWidth(){
        return this.width*this.supersampling;
    }
	
	/**
	 * Get height of canvas with supersampling
	 * @returns the height with supersampling
	 */
    getHeight(){
        return this.height*this.supersampling;
    }

	/**
	 * Draws a pixel to this Canvas. Note that RGBA are between 0 and 255
	 * @param  {{x: Number, y: Number, r: Number, g: Number, b: Number, a: Number}} pixel The Pixel to draw
	 */
	drawPixel(pixel){
		this.pixelImageData.data[0] = pixel.r;
		this.pixelImageData.data[1] = pixel.g;
		this.pixelImageData.data[2] = pixel.b;
		this.pixelImageData.data[3] = pixel.a;
		this.context.putImageData(this.pixelImageData, pixel.x/this.supersampling, pixel.y/this.supersampling);
	}
	
	/**
	 * Draws a pixel to the supersampled ArrayBuffer
	 * @param {*} pixel - The pixel to draw
	 */
	drawBufferedPixel(pixel){
		var index = 4 * (pixel.x + pixel.y * this.getWidth()) - 4;
		this.buffer.data[index] = pixel.r;
		this.buffer.data[index+1] = pixel.g;
		this.buffer.data[index+2] = pixel.b;
		this.buffer.data[index+3] = pixel.a;
	}

	/**
	 * Flushes the supersampled ArrayBuffer to the rendered canvas' drawing context
	 */
	flushBuffer(){
		this.bufferedContext.putImageData(this.buffer, 0, 0);
		this.context.drawImage(this.bufferedImage, 0,0); //Still not working
	}

	/**
	 * Clears the supersampled ArrayBuffer
	 */
	clearBuffer(){
		this.buffer = this.context.createImageData(this.getWidth(), this.getHeight());
	}

	/**
	 * Draws a Line on the canvas directly between 2 points
	 * @param {{x1,x2,y1,y2}} line 
	 */
	drawLine(line){
		this.context.beginPath();
		this.context.moveTo(line.x1, line.y1);
		this.context.lineTo(line.x2, line.y2);
		this.context.stroke();
	}
}
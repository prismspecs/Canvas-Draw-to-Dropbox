/*
  give post it notes a minimum life
  look at post it thats about to be replaced, has it been there for 60 secs? if not, dont check for new files


  add keyboard mode
  give a selection of 2 fonts to choose from (big one, small one) but randomize those 2 fonts on load


  add brush thickness selection


*/


var readyToGo = false; // secret agent mode: must tap the eye after hitting save.


$(document).ready(function() {
	// let's randomize some fonts teehee
	$("#thankyou").fadeOut(0);
	$("#thankyou").css("opacity", 1);

});


// flags
var lowResMode = false;
var ratio = 1.2048192771;

var brush = 0; // 0 small, 1 med, 2 large

// target the entire page, and listen for touch events
$('canvas').on('touchstart touchmove', function(e) {
	//prevent native touch activity like scrolling
	e.preventDefault();
});

// canvas array to enable undo
var cPushArray = new Array();
var cStep = -1;

function cPush() {
	//console.log("push");
	cStep++;
	if (cStep < cPushArray.length) {
		cPushArray.length = cStep;
	}
	// save the current state of the canvas into array
	cPushArray.push(document.getElementById('canvas').toDataURL());
}

function cUndo() {

	if (cStep > 0) {
		cStep--;
		var canvasPic = new Image();
		//console.log("undo");
		canvasPic.src = cPushArray[cStep];
		canvasPic.onload = function() {
			//PEN.context.drawImage(canvasPic, 0, 0);
			PEN.undo(canvasPic);
		}
	}
}

// function cRedo() {
//     if (cStep < cPushArray.length-1) {
//         cStep++;
//         var canvasPic = new Image();
//         canvasPic.src = cPushArray[cStep];
//         canvasPic.onload = function () { PEN.context.drawImage(canvasPic, 0, 0); }
//     }
// }


function Pen(new_context) {
	var tool = this;
	var context = new_context;
	this.started = false;
	var move_count = 0;

	if (lowResMode)
		context.lineWidth = 2.5;
	else
		context.lineWidth = 10;

	context.lineJoin = 'round';
	context.lineCap = 'round';
	var lastx = 0;
	var lasty = 0;

	// create an in-memory canvas
	var memCanvas = document.createElement('canvas');

	memCanvas.width = canvas.scrollWidth;
	memCanvas.height = canvas.scrollHeight;

	var memCtx = memCanvas.getContext('2d');

	this.points = [];

	this.touchstart = function(ev) {
		tool.points.push({
			x: ev._x,
			y: ev._y
		});
		tool.started = true;

	};

	this.touchmove = function(ev) {
		if (tool.started) {
			context.clearRect(0, 0, canvas.scrollWidth, canvas.scrollHeight);
			// put back the saved content
			context.drawImage(memCanvas, 0, 0);
			tool.points.push({
				x: ev._x,
				y: ev._y
			});
			drawPoints(context, tool.points);
		}
	};

	this.touchend = function(ev) {
		if (tool.started) {

			// should we draw a dot?
			if (tool.points.length < 2) {
				context.beginPath();
				if (lowResMode)
					context.arc(ev._x, ev._y, 2, 0, 2 * Math.PI, false);
				else
					context.arc(ev._x, ev._y, 5, 0, 2 * Math.PI, false);
				context.fillStyle = 'black';
				context.fill();
				context.closePath();
			}

			tool.started = false;
			// When the pen is done, save the resulting context
			// to the in-memory canvas
			memCtx.clearRect(0, 0, canvas.scrollWidth, canvas.scrollHeight);
			memCtx.drawImage(canvas, 0, 0);
			tool.points = [];

			cPush();
		}
	};


	this.undo = function(incoming) {
		console.log(incoming);
		context.clearRect(0, 0, canvas.scrollWidth * ratio, canvas.scrollHeight * ratio);
		context.drawImage(incoming, 0, 0);

		memCtx.clearRect(0, 0, canvas.scrollWidth * ratio, canvas.scrollHeight * ratio);
		memCtx.drawImage(incoming, 0, 0);
	}


	// clear both canvases!
	this.clear = function() {
		context.clearRect(0, 0, canvas.scrollWidth * ratio, canvas.scrollHeight * ratio);
		memCtx.clearRect(0, 0, canvas.scrollWidth * ratio, canvas.scrollHeight * ratio);
	};

	this.changeBrushSize = function(bSize) {
		context.lineWidth = bSize;
	}

}

// The general-purpose event handler. This function determines the mouse position relative to the canvas element.

function ev_canvas(ev) {
	if (false) {
		ev._x = ev.touches[0].clientX;
		ev._y = ev.touches[0].clientY; // CH: Is there a better way to do this?
	} else if (ev.layerX || ev.layerX == 0) { // Firefox
		ev._x = ev.layerX;
		ev._y = ev.layerY;
	} else if (ev.offsetX || ev.offsetX == 0) { // Opera
		ev._x = ev.offsetX;
		ev._y = ev.offsetY;
	}

	if (lowResMode) {
		// adjust ratio, since canvas is 83%
		ev._x *= ratio;
		ev._y *= ratio;
		ev._x = ev._x / 2;
		ev._y = ev._y / 2;
	} else {
		// ev._x = ev._x - 0;
		// ev._y = ev._y - 0;
		ev._x *= ratio;
		ev._y *= ratio;
	}

	// Call appropriate event handler
	var func = PEN[ev.type];
	if (func) {
		func(ev);
	}
}

function drawPoints(ctx, points) {

	if (points.length < 6) return;
	if (points.length < 6) {
		var b = points[0];
		ctx.beginPath(), ctx.arc(b.x, b.y, ctx.lineWidth, 0, Math.PI * 2, !0), ctx.closePath(), ctx.fill();
		return;
	}
	ctx.beginPath(), ctx.moveTo(points[0].x, points[0].y);
	for (i = 1; i < points.length - 2; i++) {
		var c = (points[i].x + points[i + 1].x) / 2,
			d = (points[i].y + points[i + 1].y) / 2;
		ctx.quadraticCurveTo(points[i].x, points[i].y, c, d)
	}
	ctx.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y), ctx.stroke()
}

setTimeout(function() {
	// Bind canvas to listeners
	var canvas = document.getElementById('canvas');

	// set up post it note image background so that its
	// a little bit bigger than the drawing area
	var postbg = document.getElementById('postbg');

	var marginTop = (document.body.scrollHeight - postbg.scrollWidth) / 2;
	$("#postbg").css({
		top: marginTop,
		height: postbg.scrollWidth
	});

	if (lowResMode)
		canvas.width = postbg.scrollWidth / 2;
	else
		canvas.width = postbg.scrollWidth;

	canvas.height = canvas.width;



	PEN = new Pen(canvas.getContext('2d'));

	changeBrush(1);

	canvas.addEventListener('touchstart', ev_canvas, false);
	canvas.addEventListener('touchmove', ev_canvas, false);
	canvas.addEventListener('touchend', ev_canvas, false);
}, 500);



function getReady() {
	readyToGo = true;
	$("#thankyou").fadeIn("slow", function() {
		// Animation complete
		$("#thankyou").delay(1000).fadeOut("slow");
	});
}



function uploadFile() {

	if (readyToGo) {

		// access tokens migrated to accesstoken.js

		var dbx = new Dropbox.Dropbox({
			accessToken: ACCESS_TOKEN
		});

		//Get data from canvas
		var imageSringData = canvas.toDataURL('image/png');
		//Convert it to an arraybuffer
		var imageData = _base64ToArrayBuffer(imageSringData);


		dbx.filesUpload({
				path: '/' + Date.now() + ".png",
				contents: imageData
			})
			.then(function(response) {
				// var results = document.getElementById('results');
				// results.appendChild(document.createTextNode('File uploaded!'));
				console.log(response);
				alert(response.name);
			})
			.catch(function(error) {
				console.error(error);
			});

		PEN.clear();

		return false;
	}
}




// for now just a linear change brush function
function changeBrush(n) {

	brush = n;

	brushUrl = "assets/b" + brush + ".png";

	$("#b0").css("opacity", .25);
	$("#b1").css("opacity", .25);
	$("#b2").css("opacity", .25);

	$("#b" + brush).css("opacity", 1);

	var bSize = 0;
	if (brush == 0) {
		bSize = 6;
	}
	if (brush == 1) {
		bSize = 10;
	}
	if (brush == 2) {
		bSize = 14;
	}

	PEN.changeBrushSize(bSize);
}






function _base64ToArrayBuffer(base64) {
	base64 = base64.split('data:image/png;base64,').join('');
	var binary_string = window.atob(base64),
		len = binary_string.length,
		bytes = new Uint8Array(len),
		i;

	for (i = 0; i < len; i++) {
		bytes[i] = binary_string.charCodeAt(i);
	}
	return bytes.buffer;
}
// target the entire page, and listen for touch events
$('canvas').on('touchstart touchmove', function(e) {
	//prevent native touch activity like scrolling
	e.preventDefault();
});

var readyToGo = false; // secret agent mode: must tap the eye after hitting save.

var fonts_condensed = [
	"'Patrick Hand SC', cursive",
	"'Amatic SC', cursive",
	"'Patrick Hand', cursive",
	"'Caveat', cursive",
	"'Rancho', cursive",
	"'Caveat Brush', cursive"
];

var fonts_wide = ["'Satisfy', cursive", "'Architects Daughter', cursive", "'Kalam', cursive", "'Handlee', cursive", "'Shadows Into Light Two', cursive", "'Covered By Your Grace', cursive", "'Neucha', cursive"];

var random_f1, random_f2;

$(document).ready(function() {
	// let's randomize some fonts teehee
	randizeFonts();
	$("#thankyou").fadeOut(0);
	$("#thankyou").css("opacity", 1);

});

function randizeFonts() {
	// let's randomize some fonts teehee
	random_f1 = Math.floor(Math.random() * 6);
	document.getElementById("typebox").style.fontFamily = fonts_wide[random_f1];

	random_f2 = Math.floor(Math.random() * 6);
}

function clearText() {
	randizeFonts();
	$("#typebox").val("");
}

function switchFont(n) {
	if (n == 1) {
		document.getElementById("typebox").style.fontFamily = fonts_condensed[random_f1];
	} else {
		document.getElementById("typebox").style.fontFamily = fonts_condensed[random_f2];
	}
}

function switchAlign(n) {
	if (n == 1) {
		$("#typebox").css("text-align", "center");
	} else {
		$("#typebox").css("text-align", "left");
	}
}


// $('#innertype').keypress(function() {
//   $('#typeboxdiv').bt();
// });


$('#typebox').keypress(function() {

	var len = $(this).val().length;

	// var newFontSize = 0;
	//
	// if(len < 36 && len >= 0) {
	//   newFontSize = 200;
	// }
	//
	// if(len < 50 && len > 36) {
	//   newFontSize = 180;
	// }
	//
	// if(len < 70 && len > 50) {
	//   newFontSize = 160;
	// }
	//
	// if(len < 90 && len > 70) {
	//   newFontSize = 150;
	// }
	//
	// if(len < 200 && len > 90) {
	//   newFontSize = 120;
	// }
	//
	// if(screen.height < 1500) {
	//   newFontSize *= .5;
	// }


	// var newFontSize = parseInt($(this).css('font-size'));
	//
	// while($(this)[0].scrollHeight > $(this).height() + 5) {
	//   newFontSize -= 2;
	//   $(this).css('font-size', newFontSize + "px");
	// }
	//
	// if(len == 0) {
	//   newFontSize = 200;
	//   $(this).css('font-size', newFontSize + "px");
	// }

	// console.log($(this)[0].scrollHeight);

});

var intervalID = window.setInterval(refreshTyping, 500);

function refreshTyping() {
	var len = $("#typebox").val().length;
	var newFontSize = parseInt($("#typebox").css('font-size'));

	while ($("#typebox")[0].scrollHeight > $("#typebox").height() + 5) {
		newFontSize -= 2;
		$("#typebox").css('font-size', newFontSize + "px");
	}

	if (len == 0) {
		newFontSize = 200;
		$("#typebox").css('font-size', newFontSize + "px");
	}

}

setTimeout(function() {
	// Bind canvas to listeners
	var canvas = document.getElementById('canvas');

	canvas.width = 500;
	canvas.height = canvas.width;


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
		readyToGo = false;

		//var canvas = document.getElementById("canvas");
		var typebox = document.getElementById("typebox");

		html2canvas(typebox).then(function(canvas) {
			//imageStringData = canvas.toDataURL('image/png');

			// access tokens migrated to accesstoken.js

			var dbx = new Dropbox({
				accessToken: ACCESS_TOKEN
			});


			//Convert it to an arraybuffer
			var imageStringData = canvas.toDataURL('image/png');
			var imageData = _base64ToArrayBuffer(imageStringData);


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

			clearText();
			randizeFonts();

			return false;

		});
	}
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

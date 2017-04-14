$(document).ready(function() {
	var input_port  	= null;
	var input_port_id 	= null;
	var output_port 	= null;
	var output_port_id 	= null;
	var sysex 			= null;

	var app 				= $(".app");
	var alert_not_supported = $(".alert.not-supported");
	var sysex_dump 			= $("#sysex_dump");
	var manufacturer 		= $("#manufacturer");
	var sysex_visual 		= $("#sysex_visual");
	var btn_send			= $("#btn_send");
	var btn_clear			= $("#btn_clear");
	var inputs_select 		= $("#inputs_select");
	var outputs_select 		= $("#outputs_select");

	function removeListeners(ports) {
		for (var i = 0; i < ports.length; i++) {
			ports[i].removeListener('sysex');
		}
	}

	function sysexListener(sysexObject) {
		sysex = sysexObject;
		
		sysex_dump.val(sysex.data);
		manufacturer.val(sysex.target.manufacturer);
		
		sysex_visual.html('');
		for(var i=0; i<sysex.data.length; i++) {
			var v = sysex.data[i];
			sysex_visual.append('<span id="datapoint_' + i + '" class="visual_datapoint" style="display:none; background-color:rgb(' + v + ', ' + v + ', ' + v + ');"></span>');
			$("#datapoint_" + i).delay(10).fadeIn();
		}
		
		btn_clear.removeAttr("disabled");
		updateSendButton();
	}

	function updatePortSelections() {
		for (var i = 0; i < WebMidi.inputs.length; i++) {
			inputs_select.append('<option value="' + i + '">' + WebMidi.inputs[i].name + '</option>');
		}

		for (var i = 0; i < WebMidi.outputs.length; i++) {
			outputs_select.append('<option value="' + i + '">' + WebMidi.outputs[i].name + '</option>');
		}
	}

	function updateInputListeners() {
		removeListeners(WebMidi.inputs);
		WebMidi.inputs[input_port].addListener('sysex', "all", sysexListener);
	}

	function clearData() {
		if (sysex == null) {
			return false;
		}
		
		manufacturer.val('');
		sysex_dump.val('');
		
		for(var i=0; i<sysex.data.length; i++) {
			$("#datapoint_" + i).delay(10).fadeOut();
		}
		
		sysex = null;
		
		btn_clear.attr("disabled", "true");
		updateSendButton();
	}

	function updateSendButton() {
		if (sysex != null && (output_port != null && output_port != 'null')) {
			btn_send.removeAttr("disabled");
		} else {
			btn_send.attr("disabled", "true");
		}
	}

	inputs_select.change(function() {
		input_port = $(this).val();
		input_port_id = WebMidi.inputs[input_port].id;
		
		updateInputListeners();
	});

	outputs_select.change(function() {
		output_port = $(this).val();
		
		if (output_port != 'null') {
			output_port_id = WebMidi.outputs[output_port].id;			
		}
		
		updateSendButton();
	});

	btn_clear.click(function() {
		clearData();
	});
	
	btn_send.click(function() {
		if (sysex == null) {
			// TODO error handling
			return false;
		}

 		// TODO this does not work. We use the Web MIDI API directly instead sending the data with the js library.
		//WebMidi.outputs[output_port].send(sysex.data.subarray(0, 1), sysex.data.subarray(1));
		
		navigator.requestMIDIAccess({sysex: true}).then(function (midiAccess) {
			  var output = midiAccess.outputs.get(output_port_id);
			  output.send(sysex.data);
		}, function() {
			// TODO error handling
			console.log('error sending data!');
		});
	});

	WebMidi.enable(function(error) {
		if (error) {
			app.addClass("disabled");
			alert_not_supported.removeClass("hidden");

			return false;
		}
		
		updatePortSelections();
	}, true);
});

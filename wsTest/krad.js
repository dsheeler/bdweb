var RTCPeerConnection = null;
var getUserMedia = null;
var attachMediaStream = null;
var reattachMediaStream = null;
var webrtcDetectedBrowser = null;
var webrtcDetectedVersion = null;

function trace(text) {
  // This function is used for logging.
  if (text[text.length - 1] == '\n') {
    text = text.substring(0, text.length - 1);
  }
  console.log((performance.now() / 1000).toFixed(3) + ": " + text);
}

if (navigator.mozGetUserMedia) {
  console.log("This appears to be Firefox");

  webrtcDetectedBrowser = "firefox";

  webrtcDetectedVersion =
                  parseInt(navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1]);

  // The RTCPeerConnection object.
  RTCPeerConnection = mozRTCPeerConnection;

  // The RTCSessionDescription object.
  RTCSessionDescription = mozRTCSessionDescription;

  // The RTCIceCandidate object.
  RTCIceCandidate = mozRTCIceCandidate;

  // Get UserMedia (only difference is the prefix).
  // Code from Adam Barth.
  getUserMedia = navigator.mozGetUserMedia.bind(navigator);

  // Creates iceServer from the url for FF.
  createIceServer = function(url, username, password) {
    var iceServer = null;
    var url_parts = url.split(':');
    if (url_parts[0].indexOf('stun') === 0) {
      // Create iceServer with stun url.
      iceServer = { 'url': url };
    } else if (url_parts[0].indexOf('turn') === 0 &&
               (url.indexOf('transport=udp') !== -1 ||
                url.indexOf('?transport') === -1)) {
      // Create iceServer with turn url.
      // Ignore the transport parameter from TURN url.
      var turn_url_parts = url.split("?");
      iceServer = { 'url': turn_url_parts[0],
                    'credential': password,
                    'username': username };
    }
    return iceServer;
  };

  // Attach a media stream to an element.
  attachMediaStream = function(element, stream) {
    console.log("Attaching media stream");
    element.mozSrcObject = stream;
    element.play();
  };

  reattachMediaStream = function(to, from) {
    console.log("Reattaching media stream");
    to.mozSrcObject = from.mozSrcObject;
    to.play();
  };

  // Fake get{Video,Audio}Tracks
  MediaStream.prototype.getVideoTracks = function() {
    return [];
  };

  MediaStream.prototype.getAudioTracks = function() {
    return [];
  };
} else if (navigator.webkitGetUserMedia) {
  console.log("This appears to be Chrome");

  webrtcDetectedBrowser = "chrome";
  webrtcDetectedVersion =
             parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2]);

  // Creates iceServer from the url for Chrome.
  createIceServer = function(url, username, password) {
    var iceServer = null;
    var url_parts = url.split(':');
    if (url_parts[0].indexOf('stun') === 0) {
      // Create iceServer with stun url.
      iceServer = { 'url': url };
    } else if (url_parts[0].indexOf('turn') === 0) {
      if (webrtcDetectedVersion < 28) {
        // For pre-M28 chrome versions use old TURN format.
        var url_turn_parts = url.split("turn:");
        iceServer = { 'url': 'turn:' + username + '@' + url_turn_parts[1],
                      'credential': password };
      } else {
        // For Chrome M28 & above use new TURN format.
        iceServer = { 'url': url,
                      'credential': password,
                      'username': username };
      }
    }
    return iceServer;
  };

  // The RTCPeerConnection object.
  RTCPeerConnection = webkitRTCPeerConnection;

  // Get UserMedia (only difference is the prefix).
  // Code from Adam Barth.
  getUserMedia = navigator.webkitGetUserMedia.bind(navigator);

  // Attach a media stream to an element.
  attachMediaStream = function(element, stream) {
    if (typeof element.srcObject !== 'undefined') {
      element.srcObject = stream;
    } else if (typeof element.mozSrcObject !== 'undefined') {
      element.mozSrcObject = stream;
    } else if (typeof element.src !== 'undefined') {
      element.src = URL.createObjectURL(stream);
    } else {
      console.log('Error attaching stream to element.');
    }
  };

  reattachMediaStream = function(to, from) {
    to.src = from.src;
  };

  // The representation of tracks in a stream is changed in M26.
  // Unify them for earlier Chrome versions in the coexisting period.
  if (!webkitMediaStream.prototype.getVideoTracks) {
    webkitMediaStream.prototype.getVideoTracks = function() {
      return this.videoTracks;
    };
    webkitMediaStream.prototype.getAudioTracks = function() {
      return this.audioTracks;
    };
  }

  // New syntax of getXXXStreams method in M26.
  if (!webkitRTCPeerConnection.prototype.getLocalStreams) {
    webkitRTCPeerConnection.prototype.getLocalStreams = function() {
      return this.localStreams;
    };
    webkitRTCPeerConnection.prototype.getRemoteStreams = function() {
      return this.remoteStreams;
    };
  }
} else {
  console.log("Browser does not appear to be WebRTC-capable");
}

function create_handler (inst, func) {
  return (function(e){
    func.call(inst, e);
  });
}

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame
   || window.webkitRequestAnimationFrame
   || window.mozRequestAnimationFrame
   || window.oRequestAnimationFrame
   || window.msRequestAnimationFrame
   || function(callback){
      window.setTimeout(callback, 1000 / 60);
    };
})();

Kr.prototype.ws_do_reconnect = function() {
  if (this.ws_connected != true) {
    this.ws_reconnection_attempts += 1;
    if (this.ws_reconnection_attempts == 3) {
      $('#kradradio').append("<div id='websockets_connection_problem'>"
       + "<h2>Websockets connection problem using port " + window.location.port
       + "</h2></div>");
    }
    this.ws_connect();
  }
}

Kr.prototype.ws_connect = function() {
  this.ws_stay_connected = true;
  if (this.ws_connected != true) {
    if (this.ws_connecting != true) {
      this.ws_connecting = true;
      this.debug("Connecting..");
      this.ws = new WebSocket(this.ws_uri, "webrtc-ws-api");
      this.ws.onopen = create_handler(this, this.ws_on_open);
      this.ws.onclose = create_handler(this, this.ws_on_close);
      this.ws.onmessage = create_handler(this, this.ws_on_message);
      this.ws.onerror = create_handler(this, this.ws_on_error);
    } else {
      this.debug("Tried to connect but in the process of connecting.");
    }
  } else {
    this.debug("Tried to connect when already connected.");
  }
}

Kr.prototype.ws_disconnect = function() {
  this.ws_connected = false;
  this.ws_connecting = false;
  this.ws_stay_connected = false;
  this.debug("Disconnecting..");
  if (this.ws_reconnect != false) {
    window.clearInterval(this.ws_reconnect);
    this.ws_reconnect = false;
  }
  this.ws.close();
}

Kr.prototype.ws_on_open = function(evt) {
  this.ws_connected = true;
  this.debug("Connected!");
  this.ws_connecting = false;
  this.ws_reconnection_attempts = 0;

  if (this.ws_reconnect != false) {
    window.clearInterval(this.ws_reconnect);
    this.ws_reconnect = false;
  }
  if ($('#websockets_connection_problem')) {
    $('#websockets_connection_problem').remove();
  }
  this.load_interface();
  this.send_json("hello, hi, hey, how you doin mothafucka?");
  this.ux.got_sysname('six');
}

Kr.prototype.ws_on_close = function(evt) {
  this.ws_connected = false;
  this.debug("Disconnected!");
  this.unload_interface();
  this.ws_connecting = false;
  if (this.ws_stay_connected == true) {
    if (this.ws_reconnect == false) {
      this.ws_reconnect = setInterval(
       create_handler(this, this.ws_do_reconnect), 1000);
    }
  }
}

Kr.prototype.ws_on_error = function(evt) {
  this.debug("Error! " + evt.data);
}

Kr.prototype.debug = function(message) {
  console.log(message);
}

Kr.prototype.ws_on_message = function(evt) {
  this.debug("Recved: " + evt.data);
  var text = evt.data.replace(/\n/g,"\\n");
  text = text.replace(/\r/g,"\\r");
  var msg_arr = JSON.parse(text);
  for (var i = 0; i < msg_arr.length; i++) {
    this.ux.on_crate(msg_arr[i]);
  }
}

Kr.prototype.ctrl = function(path, val, dur) {
  if (typeof(dur) === 'undefined') dur = 0;
  var cmd = '{"ctrl":"' + path + ' ' + val + ' ' + dur + '"}';
  this.ws.send(cmd);
  this.debug(cmd);
}

Kr.prototype.send_json = function(json) {
  this.ws.send(json);
  this.debug(json);
}

Kr.prototype.rtc_send = function(cmd) {
  this.ws.send(cmd);
  this.debug(cmd);
}

function Kr() {
  this.ux = {};
  this.ws_uri = 'ws://' + location.hostname + ':' + 13000 + '/';
  this.ws = "";
  this.ws_reconnection_attempts = 0;
  this.ws_reconnect = false;
  this.ws_connected = false;
  this.ws_connecting = false;
  this.ws_stay_connected = true;
  this.debug("Krad Radio client created");
  this.ws_connect();
}

Kr.prototype.unload_interface = function() {
	this.ux.destroy();
	this.ux = false;
}
var rack_units = [];

Kr.prototype.load_interface = function() {
	this.ux = new Rack();
}

function Rack() {
  this.units = [];
  this.shared = {};
  this.positioned_units = [];
  this.current_page = 0;
  this.calc_rack();
  var resizeTimer;
  $(window).resize({'this':this}, function(e) {
    e.data.this.window_resize();
  });
}

Rack.prototype.window_resize = function() {
  for (var i = 0; i < this.units.length; i++) {
    if (this.units[i].window_resize) {
      this.units[i].window_resize();
    }
  }
}

Rack.prototype.share = function(key, value) {
  this.shared[key] = value;
  for (var i = 0; i < this.units.length; i++) {
    this.units[i].shared(key, this.shared);
  }
}

Rack.prototype.display_page = function(num, duration) {
  if ('undefined' === typeof duration) {
    duration = 0;
  }
  this.current_page = num;
  this.position_units(0, num, duration);
}

Rack.prototype.rack_comp_ctrl = function(unit_title, id, type, control_name,
 value, dur) {
  comp_ctrl(id, type, control_name, value, dur);
  if (typeof(dur) === 'undefined' || dur == 0) {
    var crate = new Object();
    crate.com = "kradcompositor";
    crate.ctrl = "update_subunit"
    crate.subunit_id = id;
    crate.subunit_type = type;
    crate.control_name = control_name;
    crate.value = value;

    for (var i = 0; i < this.units.length; i++) {
      for (var j = 0; j < this.units[i].address_masks.length; j++) {
        if (this.units[i].title != unit_title
         && this.units[i].address_masks[j] == "kradcompositor") {
          this.units[i].update(crate);
        }
      }
    }
  }
}

Rack.prototype.setup_rack = function(info_object) {
  /* loop through global rack_units array and call constructors */
  for (var i = 0; i < rack_units.length; i++) {
    unit = new rack_units[i]['constructor'](info_object);
    unit.width = rack_units[i]['aspect'][0];
    unit.height = rack_units[i]['aspect'][1];
    unit.page = rack_units[i]['page'] || 0;
    this.units.push(unit);
  }
}

Rack.prototype.calc_rack = function() {

  this.rack_density = 32;

  var view_width = window.innerWidth;
  var view_height = window.innerHeight;
  var rack_space_sz = view_width / this.rack_density;

  this.rack_width = Math.floor(view_width / rack_space_sz);
  this.rack_width_per = (rack_space_sz / view_width) * 100;
  this.rack_height = Math.floor(view_height / rack_space_sz);
  this.rack_height_per = (rack_space_sz / view_height) * 100;

}

Rack.prototype.destroy = function() {
  $('#' + this.sysname).remove();
}

Rack.prototype.got_sysname = function(sysname) {
  this.sysname = sysname;
  $('#kradradio').append("<div class='kradradio_station' id='"
   + this.sysname + "'></div>");

  $('#' + this.sysname).append("<div style='display: none' "
   + "class='grid'></div>");

 window.onkeypress = function(event) {
    var unicode = event.charCode ? event.charCode : event.keyCode;
    var actualkey = String.fromCharCode(unicode);
    if ((actualkey == "g") && (event.altKey == true))  {
      $(".grid").toggle();
    }
  }

  this.setup_rack({'parent_div': $('#' + this.sysname)});
  this.position_units(0);

  window.onresize = function(event) {
    kr.ux.position_units(0, kr.ux.current_page);
  }
}

/*
  $('#toggle_minimizable').bind('click', function () {
    $(".close").toggle(200);
  });

  $('.effects .close').mouseenter(function() {
    kr.close_color_backup = $(this).css('color');
    $(this).css('color', '#f00c0c');
  });

  $('.close').mouseleave(function(){
    $(this).css('color', kr.close_color_backup);
  });
}*/

Rack.prototype.first_open_rack_position = function(RCU, positioned_units) {
  var ret = null;
  var fits = 1;
  for (var j = 0; j < this.rack_height; j++) {
    for (var i = 0; i < this.rack_width; i++) {
      for (var r = 0; r < positioned_units.length; r++) {
       if (
           ((i >= positioned_units[r].x && positioned_units[r].x + positioned_units[r].width > i)
            && (j >= positioned_units[r].y && positioned_units[r].y + positioned_units[r].height > j))
           ||
             ((i+RCU.width >= positioned_units[r].x && positioned_units[r].x + positioned_units[r].width > i + RCU.width)
            && (j + RCU.height>= positioned_units[r].y && positioned_units[r].y + positioned_units[r].height > j+RCU.height))
           ||
             ((i+RCU.width >= positioned_units[r].x && positioned_units[r].x + positioned_units[r].width > i + RCU.width)
            && (j >= positioned_units[r].y && positioned_units[r].y + positioned_units[r].height > j))
           ||
             ((i >= positioned_units[r].x && positioned_units[r].x + positioned_units[r].width > i)
            && (j + RCU.height>= positioned_units[r].y && positioned_units[r].y + positioned_units[r].height > j+RCU.height))
            ||
             (i+RCU.width > this.rack_width || j + RCU.height > this.rack_height)
           ) {

          fits = 0;
          break;
        }
      }
      if (fits == 1) {
        return [i, j];
      } else {
        fits = 1;
      }
    }
  }
  return null;
}

Rack.prototype.position_units = function(auto, page, duration) {

  if (typeof(page) == 'undefined') {
    page = 0;
  }

  if (typeof(duration) == 'undefined') {
    duration = 0;
  }

  for (var i = 0; i < this.positioned_units.length; i++) {
    $(this.positioned_units[i].sel).hide(duration);
  }

  this.positioned_units = new Array();

  for (var j = 0; j < this.rack_height; j++) {
    for (var i = 0; i < this.rack_width; i++) {
      var id = i + "_" + j;
      $('#' + id).remove();
    }
  }

  this.calc_rack();
  for (var j = 0; j < this.rack_height; j++) {
    for (var i = 0; i < this.rack_width; i++) {
      var top = this.rack_height_per * j;
      var left = this.rack_width_per * i;
      var height = this.rack_height_per;
      var width = this.rack_width_per;
      var id = i + "_" + j;

      $('.grid').append("<div id='" + id + "' style='z-index: 100;" +
       "position: absolute; border: 1px solid black'></div>");

      $('#' + id).css({'top': top + '%'});
      $('#' + id).css({'left': left + '%'});
      $('#' + id).css({'width': width + '%'});
      $('#' + id).css({'height': height + '%'});
    }
  }

  for (var i = 0; i < this.units.length; i++) {
    if (this.units[i].page == 'all' || this.units[i].page == page) {
      if (auto == 1) {
        var result = this.first_open_rack_position(this.units[i], this.positioned_units);
        if (result != null) {
          this.positioned_units.push(this.units[i]);
          $(this.units[i].sel).show();
          this.units[i].x = result[0];
          this.units[i].y = result[1];
        } else {
          $(this.units[i].sel).hide();
        }
      }
      this.positioned_units.push(this.units[i]);
      $(this.units[i].sel).show(duration);
      var top = this.rack_height_per * this.units[i].y;
      var left = this.rack_width_per * this.units[i].x;
      var height = this.rack_height_per * this.units[i].height;
      var width = this.rack_width_per * this.units[i].width;

      $(this.units[i].sel).css({'top': top + '%' });
      $(this.units[i].sel).css({ 'left': left + '%' });
      $(this.units[i].sel).css({ 'width': width + '%' });
      $(this.units[i].sel).css({ 'height': height + '%' });
    }
  }
  this.window_resize();
}

Rack.prototype.on_crate = function(crate) {
  if (crate.com == "kradmixer") {
    for (var i=0; i < this.units.length; i++) {
      for (var j=0; j <this.units[i].address_masks.length; j++) {
        if (this.units[i].address_masks[j] == "kradmixer") {
          if (crate.ctrl == "peak_portgroup") {
            this.units[i].update(crate);
          }
          if (crate.ctrl == "control_portgroup") {
            this.units[i].update(crate);
          }
          if (crate.ctrl == "effect_control") {
            this.units[i].update(crate);
          }
          if (crate.ctrl == "update_portgroup") {
            this.units[i].update(crate);
          }
          if (crate.ctrl == "add_portgroup") {
            this.units[i].update(crate);
          }
          if (crate.ctrl == "remove_portgroup") {
            this.units[i].update(crate);
          }
          if (crate.ctrl == "set_mixer_params") {
            this.units[i].update(crate);
          }
        }
      }
    }
  }
  if (crate.com == "rtc") {
    for (var i=0; i < this.units.length; i++) {
      for (var j=0; j < this.units[i].address_masks.length; j++) {
        if (this.units[i].address_masks[j] == "rtc") {
          if (crate.ctrl == 'user_registered') {
            this.units[i].update(crate);
          }
          if (crate.ctrl == 'user_unregistered') {
            this.units[i].update(crate);
          }
           if (crate.ctrl == "call") {
            this.units[i].update(crate);
          }
          if (crate.ctrl == "answer") {
            this.units[i].update(crate);
          }
          if (crate.ctrl == "candidate") {
            this.units[i].update(crate);
          }
          if (crate.names != null) {
            this.units[i].update(crate);
          }
        }
      }
    }
  }
  if (crate.com == "kradcompositor") {
    for (var i=0; i < this.units.length; i++) {
      for (var j=0; j < this.units[i].address_masks.length; j++) {
        if (this.units[i].address_masks[j] == "kradcompositor") {
          if (crate.ctrl == "add_videoport") {
            this.units[i].update(crate);
          }
          if (crate.ctrl == "remove_subunit") {
            this.units[i].update(crate);
          }
          if (crate.ctrl == "update_subunit") {
            this.units[i].update(crate);
          }
          if (crate.ctrl == "set_frame_rate") {
            this.units[i].got_frame_rate(crate.numerator, crate.denominator);
            return;
          }
          if (crate.ctrl == "set_frame_size") {
            this.units[i].got_frame_size(crate.width, crate.height);
            return;
          }
        }
      }
    }
  }

  if (crate.com == "kradradio") {
    if (crate.info == "cpu") {
      kr.got_system_cpu_usage(crate.system_cpu_usage);
      return;
    }
    if (crate.info == "sysname") {
      this.got_sysname(crate.infoval);
      return;
    }
  }
  if (crate.com == "rtc")
  if (crate.com == "kradlink") {
    if (crate.ctrl == "update_link") {
      kr.got_update_link(crate.link_num,
       crate.update_item, crate.update_value);
      return;
    }
    if (crate.ctrl == "add_link") {
      kr.got_add_link(crate);
      return;
    }
    if (crate.ctrl == "remove_link") {
      kr.got_remove_link(crate);
      return;
    }
    if (crate.ctrl == "add_decklink_device") {
      kr.got_add_decklink_device(crate);
      return;
    }
  }
}

Kr.prototype.display = function() {
  var cmd = {};
  cmd.com = "kradcompositor";
  cmd.cmd = "display";

  var JSONcmd = JSON.stringify(cmd);
  kr.ws.send(JSONcmd);
}

Kr.prototype.addsprite = function(filename) {
  var cmd = {};
  cmd.com = "kradcompositor";
  cmd.cmd = "add_subunit";
  cmd.subunit_type = "sprite";
  cmd.filename = filename;

  var JSONcmd = JSON.stringify(cmd);
  kr.ws.send(JSONcmd);
}

Rack.prototype.push_dtmf = function(value) {
  kr.ctrl("m/DTMF/t", value);
  kr.kode += value;
}

$(document).ready(function() {
  rack_units.push({'constructor': Pager, 'aspect': [32,1], 'page': 'all'});
});

function Pager(info_object) {
  this.title = "Pager";
  this.description = "Multiple rack pages, sir";
  this.aspect_ratio = [32,1];
  this.x = 0;
  this.y = 0;
  this.width = 0;
  this.height = 0;
  this.address_masks = [];
  this.div_text = "<div id='pager' class='RCU pager'></div>";
  this.sel = "#pager";
  info_object['parent_div'].append(this.div_text);
  this.resizeTimer;

  $(this.sel).append("<span class='page' id='page1'>Page 1</span><span class='page' id='page2'>Page 2</span><span class='page' id='page3'>Page 3</span>");
  $('#page1').addClass('selected');
  $('.page').bind("click", function(e) {
    e.preventDefault();
    $('.page').removeClass('selected');
    $(this).addClass('selected');
    var id = $(this).attr('id');
    var num = id.match(/\d+/);
    num--;
    kr.ux.display_page(num);
    return false;
  });

  /*$(window).load(function() {
    setTimeout(page_resize, 100);
    setTimeout(page_resize, 200);
    setTimeout(page_resize, 400);
  });*/
}

Pager.prototype.window_resize = function() {
  clearTimeout(this.resizeTimer);
  this.resizeTimer = setTimeout(this.page_resize, 100);
};

Pager.prototype.page_resize = function() {
  $('.page').css('font-size', 0.8*$('#pager').height()+'px');
}

Pager.prototype.update = function(crate) {
}

Pager.prototype.shared = function(key, shared_object) {
}


$(document).ready(function() {
  rack_units.push({'constructor': Rtc, 'aspect': [32,20], 'page': 0});
});

function LocalStream(name, streamId, stream, containerDiv, divName, canvasId) {

  this.name = name;
  this.divName = divName;
  this.canvasId = canvasId;
  this.streamId = streamId;
  this.groupId = streamId + '_group';
  this.active = true;

  var stream_plus_hangup_div_id = this.divName + '_plus_hangup';

  containerDiv.append('<div style="float:left" id="'
   + stream_plus_hangup_div_id
   + '"><div class="local_stream_div ' + this.groupId
   + '" id="' + this.divName + '"></div></div>');

  var local_stream_div = $('#' + this.divName);
  var local_stream_id = "local_stream_" + this.streamId;
  local_stream_div.append('<p id="' + local_stream_id + '" '
     + 'class="local_stream_label">' + this.name
     + '</p><canvas class="local_stream_spectrum_canvas" id="'
   + canvasId + '"></canvas>');

  var vidName = this.divName + '_video';
  local_stream_div.append('<video class="' + this.groupId
   + ' local_stream_video"'
   + ' id="' + vidName + '" autoplay muted></video>');

  $('.' + this.groupId).css('visibility', 'hidden');

  this.videoDiv = document.querySelector('#' + vidName);
  $('#' + vidName).bind('play', {'groupId': this.groupId}, function(e) {
    kr.rtc.handleLocalVideoStream(e.data.groupId, vidName, local_stream_div);
  });

  this.vidName = vidName;

  this.spectrumCanvasId = canvasId;
  this.spectrumCanvas = document.querySelector('#' + this.spectrumCanvasId);

  this.stream = stream;
  var audio_tracks = stream.getAudioTracks();
  var video_tracks = stream.getVideoTracks();
  console.log(stream);
  console.log('audio tracks: ' + audio_tracks.length);
  console.log('vid tracks: ' + video_tracks.length);
  attachMediaStream(this.videoDiv, stream);

  this.removeButtonId = streamId + "_remove_button";

  $('#' + stream_plus_hangup_div_id).append('<div class="button_wrap_streams">'
   + '<div class="krad_button3" id="' + this.removeButtonId + '">'
   + 'REMOVE ' + this.name + '</div></div>');

  $('#' + this.removeButtonId).bind('click', {'stream':this}, function(e) {
    $('#' + e.data.stream.divName).remove();
    $('#' + e.data.stream.removeButtonId).remove();
    for (var i = 0; i < kr.rtc.peers.length; i++) {
      var callId = 'call_' + kr.rtc.peers[i].name + '_with_'
       + e.data.stream.streamId;
      $('#' + callId).remove();
    }
    var idx = kr.rtc.localStreams.indexOf(e.data.stream);
    kr.rtc.localStreams.splice(idx,1);
  });
}

LocalStream.prototype.remove = function() {
}

Rtc.prototype.handleLocalVideoStream = function(groupId, vidName, local_stream_div) {
  if ($('#' + vidName).height() != 150) {
      var w = $('#' + vidName).width();
      var h = $('#' + vidName).height();
      var r = w / h;
      var new_w = 300;
      $('#' + vidName).css('width', new_w);
      $('#' + vidName).css('height', new_w / r);
      local_stream_div.css('width', $('#' + vidName).width());
      local_stream_div.css('height', $('#' + vidName).height());
      $('.' + groupId).css('visibility', 'visible');
      $('.' + groupId).hide();
      $('.' + groupId).show("highlight");
  } else {
    setTimeout(function() {
      kr.rtc.handleLocalVideoStream(groupId, vidName, local_stream_div);
    }, 100);
  }
}

function Peer(name) {
  this.connection = new RTCPeerConnection(null);
  this.connection.onicecandidate = handleIceCandidate.bind(this);
  this.connection.onaddstream = handleRemoteStreamAdded.bind(this);
  this.connection.onremovestream = handleRemoteStreamRemoved;
  this.connection.onicechange = function(e) { console.log('onicechange', e) };
  this.name = name;
  this.streams = [];
  this.readyToProcessCandidates = false;
  this.queuedCandidates = [];
  console.log('Created RTCPeerConnnection');
}

Peer.prototype.handleIceCandidate = function(candidate) {
  this.queuedCandidates.push(candidate);
  this.processQueuedCandidates();
}

Peer.prototype.processQueuedCandidates = function() {
  if (this.readyToProcessCandidates == true) {
    while(this.queuedCandidates.length > 0) {
      this.connection.addIceCandidate(this.queuedCandidates.shift());
    }
  }
}


Peer.prototype.destroy = function() {
}

function Rtc(info_object) {
  kr.rtc = this;
  this.title = "Rtc";
  this.description = "Real time communication, baby";
  this.aspect_ratio = [16,9];
  this.x = 0;
  this.y = 1;
  this.width = 0;
  this.height = 0;
  this.address_masks = ['rtc'];
  this.div_text = "<div id='rtc' class='RCU rtc'></div>";
  this.sel = "#rtc";

  var audio_context_call = window.webkitAudioContext || window.AudioContext;
  this.audio_context = new audio_context_call();
  this.peers = [];
  this.remoteStreams = [];
  this.retiredLocalStreams = [];
  this.localStreams = [];

  this.name = null;

  this.turnReady;
  this.pc_constraints = {'optional': [{'DtlsSrtpKeyAgreement': true}]};
  /*Set up audio and video regardless of what devices are present.*/
  this.sdpConstraints = {'mandatory': {
  'OfferToReceiveAudio':true,
  'OfferToReceiveVideo':true }};

  info_object['parent_div'].append(this.div_text);

  $(this.sel).append("\
  <div style='width:100%;float:left'>\
    <audio id='six_login_audio'>\
      <source src='http://six600110.com/bong.ogg' type='audio/ogg' />\
    </audio>\
    <audio id='logout_audio'>\
      <source src='http://six600110.com/logout.wav' type='audio/wav' />\
    </audio>\
    <audio id='login_audio'>\
      <source src='http://six600110.com/login.wav' type='audio/wav' />\
    </audio>\
    <div style='float:left'>\
      <div class='button_wrap_streams'>\
        <div class='krad_button' id='start_media'>ADD STREAM</div>\
      </div>\
      <div><input id='webrtc_name' type='text'></input></div>\
      <div>\
        <div class='button_wrap'>\
          <div class='krad_button' id='register'>REGISTER</div>\
        </div>\
        <div class='button_wrap'>\
         <div class='krad_button' id='unregister'>UNREGISTER</div>\
        </div>\
      </div>\
      <ul style='float:left' id='user_list'></ul>\
      </div>\
        <div style='margin:20px;float:left' id='localVideoContainer'></div>\
    <ul id='local_streams'></ul>\
  </div>\
  <div style='margin:20px;float:left' id='remoteVideoContainer'></div>\
  <div id='dialog'></div>\
  ");

  this.localVideosContainer = $('#localVideoContainer');
  this.remoteVideosContainer = $('#remoteVideoContainer');

  $('#register').bind('click', function(e) {
    kr.rtc.register($('#webrtc_name').val());
  });

  $('#unregister').bind('click', function(e) {
    kr.rtc.unregister();
  });

  $('#start_media').bind('click', function(e) {
    kr.rtc.startMedia();
  });

  $('#start_chat').bind('click', function(e) {
    kr.rtc.callPeer($('#callee_name').val());
  });

  window.onbeforeunload = function(){
    console.log("SAYING GOODBYE");
    kr.rtc.sendMessage('bye');
  }

}

Rtc.prototype.ring = function() {
  for (var i = 0; i < 8; i++) {
    setTimeout(this.bell, 120*i);
  }
}

Rtc.prototype.bell = function() {
  playTone(80, 0.01,  kr.rtc.audio_context);
  playTone(240, 3/120.0, kr.rtc.audio_context);
  playTone(400, 2/200.0, kr.rtc.audio_context);
  playTone(666, 2/333.0, kr.rtc.audio_context);
  playTone(1000, 10/500.0, kr.rtc.audio_context);
  playTone(1600,  8/800.0, kr.rtc.audio_context);
  playTone(2200, 5/1100.0, kr.rtc.audio_context);
  playTone(4000, 20/2000.0, kr.rtc.audio_context);
  playTone(3000, 30/1500.0, kr.rtc.audio_context);
  playTone(5000, 12/2500.0, kr.rtc.audio_context);
}


function playTone(freq, amp, ctx) {
  var o = ctx.createOscillator();
  var g = ctx.createGain();
  o.frequency.value = freq;
  o.type = "triangle";
  o.connect(g);
  g.connect(ctx.destination);
  o.start(ctx.currentTime)
  g.gain.setValueAtTime(0.0,ctx.currentTime);
  g.gain.linearRampToValueAtTime(amp * 0.8, ctx.currentTime+0.01);
  g.gain.linearRampToValueAtTime(amp * 0.6, ctx.currentTime+0.02);
  g.gain.linearRampToValueAtTime(amp * 0.6, ctx.currentTime+0.08);
  g.gain.linearRampToValueAtTime(0.0, ctx.currentTime+0.1);
}

Rtc.prototype.register = function(name) {
  if (name != "") {
    this.name = name;
    console.log('Register Name: ' + this.name);

    var cmd = '{"rtc":"register","name":"' + this.name + '"}';
    this.sendMessage(cmd);
  }
}

Rtc.prototype.unregister = function() {
  var cmd = '{"rtc":"unregister"}';
  this.sendMessage(cmd);
}

Rtc.prototype.userRegistered = function(name) {
  var audio_name = 'audio';
  $('#user_list').append('<li id="' + name + '">' + name
  + '</li>');

  for (var i = 0; i < kr.rtc.localStreams.length; i++) {
    var button_id = "call_" + name + "_with_"
     + this.localStreams[i].streamId;

    $('#' + name).append("<span class='call_button krad_button' id='" 
     + button_id + "'>Call with '" + this.localStreams[i].name + "'</span>");
    $('#' + button_id).bind("click", {'name': name, 'stream':
      kr.rtc.localStreams[i].stream}, function(e) {
      kr.rtc.callPeer(e.data.name, e.data.stream);
    });
  }

  var audio = document.getElementById('login_audio');
  if (name == 'six' || name == 'six600110' || name == 'dan'
   || name == 'cheech') {
     audio = document.getElementById('six_login_audio');
  }
  audio.play();
  var found = 0;
  for (var j = 0; j < this.peers.length; j++) {
    if (this.peers[j].name == name) {
      found = 1;
      break;
    }
  }

  if (name == this.name) {
    $('#' + name).html(this.name + " (you)");
  } else {
    $('#' + name).droppable( {
      drop: function(event, ui) {
        alert("Calling " + name);
        kr.rtc.callPeer(name, ui.stream);
      }
    });
  }


  if (name != this.name) {
    if (found == 0 && name != "") {
      console.log('creating peer', name);
      this.peers.push(new Peer(name));
    }
  }
}

Rtc.prototype.userUnregistered = function(name) {
  $('#' + name).remove();
  $('.call_button').remove();
  var audio = document.getElementById('logout_audio');
  audio.play();

  for (var j = 0; j < this.peers.length; j++) {
    if ((this.name == name) || (this.peers[j].name == name)) {
      this.peers[j].destroy();
      this.peers.splice(j, 1);
    }
  }
}

Rtc.prototype.callPeer = function(name, stream) {
  for (var i = 0; i < this.peers.length; i++) {
    if (this.peers[i].name == name) {
      if (typeof(stream) != 'undefined') {
        this.peers[i].connection.addStream(stream);
      } else {
        for (var j = 0; j < this.localStreams.length; j++) {
          try {
            this.peers[i].connection.addStream(this.localStreams[j].stream);
            var stream = this.localStreams[j].stream;
            var audio_tracks = stream.getAudioTracks();
            var video_tracks = stream.getVideoTracks();
            console.log('audio tracks: ' + audio_tracks.length);
            console.log('vid tracks: ' + video_tracks.length);
          } catch (e) {
            if (e.name != "NS_ERROR_UNEXPECTED") {
              throw e;
            } else {
              console.log('error adding local stream to chat', e);
            }
          }
        }
      }
      this.peers[i].connection.createOffer(
       setLocalAndSendOffer.bind(this.peers[i]), handleCreateOfferError);
    }
  }
}

function setLocalAndSendOffer(sessionDescription) {
  // Set Opus as the preferred codec in SDP if Opus is present.
  sessionDescription.sdp = kr.rtc.preferOpus(sessionDescription.sdp);
  var callee_name = this.name;
  var cmd = '{"rtc":"call","name":"' + callee_name + '","sdp":"'
   + sessionDescription.sdp + '"}';
  console.log('setLocalAndSendMessage sending message', cmd);
  for (var i = 0; i < kr.rtc.peers.length; i++) {
    if (kr.rtc.peers[i].name == callee_name) {
      kr.rtc.peers[i].connection.setLocalDescription(sessionDescription);
      kr.rtc.peers[i].readyToProcessCandidates = true;
      kr.rtc.peers[i].processQueuedCandidates();
     }
  }
  kr.rtc.sendMessage(cmd);
}

Rtc.prototype.answerPeer = function(name) {
  for (var i = 0; i < this.peers.length; i++) {
    if (this.peers[i].name == name) {
      for (var j = 0; j < this.localStreams.length; j++) {
        try {
          this.peers[i].connection.addStream(this.localStreams[j].stream);
        } catch (e) {
          if (e.name != "NS_ERROR_NOT_AVAILABLE") {
            throw e;
          }
        }
      }
      kr.rtc.peers[i].readyToProcessCandidates = true;
      kr.rtc.peers[i].processQueuedCandidates();
      this.peers[i].connection.createAnswer(
       setLocalAndSendAnswer.bind(this.peers[i]),
       handleCreateAnswerError, this.sdpConstraints);
    }
  }
}

function setLocalAndSendAnswer(sessionDescription) {
  // Set Opus as the preferred codec in SDP if Opus is present.
  sessionDescription.sdp = kr.rtc.preferOpus(sessionDescription.sdp);
  var callee_name = this.name;
  var cmd = '{"rtc":"answer","name":"' + callee_name + '","sdp":"'
   + sessionDescription.sdp + '"}';
  for (var i = 0; i < kr.rtc.peers.length; i++) {
    if (kr.rtc.peers[i].name == callee_name) {
      kr.rtc.peers[i].connection.setLocalDescription(sessionDescription);
     }
  }
  kr.rtc.sendMessage(cmd);
}

Rtc.prototype.startMedia = function() {
  var constraints = {video: true, audio: true};
  getUserMedia(constraints, handleUserMedia, handleUserMediaError);
  console.log('Getting user media with constraints', constraints);
}

Rtc.prototype.sendMessage = function(message) {
  console.log('Sending: ', message);
  kr.rtc_send(message);
}

function handleUserMedia(stream) {
  console.log('Adding local stream.');
  var numLocalStreams = kr.rtc.localStreams.length;
  var divName = 'local_stream_div_' + numLocalStreams;
  var canvasId = divName + '_spectrum_canvas';
  var streamId = 'stream_' + (numLocalStreams + 1);
  var streamName = 'Stream ' + (numLocalStreams + 1);
  var localStream = new LocalStream(streamName, streamId, stream,
   kr.rtc.localVideosContainer, divName, canvasId);
  kr.rtc.localStreams.push(localStream);
  /*var sBox = new SpectrumBox(2048, 64, canvasId, kr.rtc.audio_context,
   SpectrumBox.Types.FREQUENCY);
  var ctx = sBox.getCanvasContext();
  ctx.fillStyle = 'rgb(50,100,200)';
  var microphone = kr.rtc.audio_context.createMediaStreamSource(stream);
  microphone.connect(sBox.getAudioNode());
  sBox.enable();*/
  for (var i = 0; i < kr.rtc.peers.length; i++) {
    if (kr.rtc.peers[i].name != kr.rtc.name) {
      var button_id = "call_" + kr.rtc.peers[i].name + "_with_"
         + streamId;
      $('#' + kr.rtc.peers[i].name).append("<span class='krad_button' id='" + button_id + "'>Call with '"
       + localStream.name + "'</span>");
      $('#' + button_id).bind("click", {'name': kr.rtc.peers[i].name, 'stream':
        localStream.stream}, function(e) {
        kr.rtc.callPeer(e.data.name, e.data.stream);
      });
    }
  }
}

function handleUserMediaError(error){
  console.log('navigator.getUserMedia error: ', error);
}

function handleIceCandidate(event) {
  console.log('handleIceCandidate event: ', event);
  if (event.candidate) {
    var callee_name = this.name;
    var cmd = '{"rtc":"candidate","user":"' + callee_name + '",'
     + '"type":"candidate","label":"'
     + event.candidate.sdpMLineIndex + '","id":"' + event.candidate.sdpMid
     + '","candidate":"' + event.candidate.candidate + '"}';
    kr.rtc.sendMessage(cmd);
  } else {
    console.log('End of candidates.');
  }
}

function handleRemoteStreamAdded(event) {
  /*Note: through the use of .bind, 'this' is the Peer who has added
    this remote stream.*/
  console.log('Remote stream added.');
  this.streams.push(event.stream);
  var streamId = 'remote_stream_' + this.name + '_' + this.streams.length;
  var remoteCanvasId = streamId + "_canvas";
  var group_id = streamId + '_group';

  var call_container_id = streamId + '_call_container';
  var call_plus_hangup_id = call_container_id + '_plus_hangup';
  var hangup_button_id = call_container_id + '_hangup';

  $('#remoteVideoContainer').append('<div style="float:left" id="'
   + call_plus_hangup_id + '" class="call_plus_hangup"><div id="' + call_container_id
   + '" class="call_container ' + group_id + '"><p class="remote_video_label">' + this.name
   + '</p><video id="' + streamId
   + '" class="remote_video ' + group_id + '" autoplay></video>'
   + '<canvas class="local_video_canvas ' + group_id + '" id="' + remoteCanvasId
   + '"></canvas></div><div class="button_wrap">'
   + '<div id="' + hangup_button_id
   + '" class="krad_button3">Hangup</div></div></div>');

  $('.' + group_id).css('visibility', 'hidden');

  /*var sBox = new SpectrumBox(2048, 64, remoteCanvasId, kr.rtc.audio_context,
  SpectrumBox.Types.FREQUENCY);
  var ctx = sBox.getCanvasContext();
  ctx.fillStyle = 'rgb(50,100,200)';
  var microphone = kr.rtc.audio_context.createMediaStreamSource(
   event.stream);
  microphone.connect(sBox.getAudioNode());
  sBox.enable();*/

  $('#' + call_plus_hangup_id).draggable({stack: ".call_plus_hangup",
   cancel: ".button_wrap"});
  $('#' + call_container_id).resizable({ aspectRatio: true});

  $('#' + hangup_button_id).bind('click', function() {
    $('#' + call_plus_hangup_id).remove();
  });

  if (kr.rtc.localStreams.length > 0) {
    var i = 0;
    var vidId = 'call_local_video_' + this.name + '_' + i;
    var local_video_label_id = 'local_video_label_' + this.name + '_' + i;
    var local_video_div_id = 'local_video_div_' + this.name + '_' + i;
    var canvasId = local_video_div_id + '_spectrum_canvas';

    $('#' + call_container_id).append('<div id="' + local_video_div_id
     + '" class="local_video_div"><p id="' + local_video_label_id + '" '
     + 'class="local_video_label">' + kr.rtc.name
     + '</p><video id="' + vidId + '" class="local_video" '
     + 'muted autoplay></video><canvas class="local_video_canvas" id="'
     + canvasId + '"></canvas></div>');

    /*var sBox = new SpectrumBox(2048, 64, canvasId, kr.rtc.audio_context,
     SpectrumBox.Types.FREQUENCY);
    var ctx = sBox.getCanvasContext();
    ctx.fillStyle = 'rgb(50,100,200)';
    var microphone = kr.rtc.audio_context.createMediaStreamSource(
     kr.rtc.localStreams[i].stream);
    microphone.connect(sBox.getAudioNode());
    sBox.enable();*/
    $('#' + vidId).bind('play', function() {
      kr.rtc.handleRemoteVideoPlaying(group_id, streamId,
       call_container_id, local_video_div_id, vidId, canvasId);
    });

    var localVideoElem = document.querySelector('#' + vidId);
    $('#' + local_video_div_id).resizable({
      stack: '.local_video_div',
      aspectRatio: true,
      containment: '#' + call_container_id,
      stop: function(e, ui) {
        var w = $('#' + call_container_id).width();
        var h = $('#' + call_container_id).height();
        $(this).css('width', 100.0*$(this).width()/w + '%');
        $(this).css('height', 100.0*$(this).height()/h + '%');
        $(this).css('top', 100.0*ui.position.top/h + '%');
        $(this).css('left', 100.0*ui.position.left/w + '%');

      }
    });

    attachMediaStream(localVideoElem, kr.rtc.localStreams[i].stream);
    $('#' + local_video_div_id).css('top', (6 + 40*i) + '%');


    $('#' + local_video_div_id).draggable({
      containment: '#' + call_container_id,
      stop: function(e, ui) {
        var w = $('#' + call_container_id).width();
        var h = $('#' + call_container_id).height();
        $(this).css('top', 100.0*ui.position.top/h + '%');
        $(this).css('left', 100.0*ui.position.left/w + '%');
      }
    });
  }

  var vidElement = document.querySelector('#' + streamId);
  attachMediaStream(vidElement, event.stream);
}

Rtc.prototype.handleRemoteVideoPlaying = function(groupId, streamId,
 call_container_id, local_video_div_id, vidId, canvasId) {
  var vid_height = $('#' + streamId).height();
  var vid_width = $('#' + streamId).width();
  var ratio = vid_height != 0 ? vid_width/vid_height : 0;

  if ((ratio != 0) && (ratio != 2)) {
    $('#' + call_container_id).css('height', $('#' + streamId).height());

    var w = $('#' + call_container_id).width();
    var h = $('#' + call_container_id).height();
    $('#' + local_video_div_id).css('height',
     100 * $('#' + vidId).height()/h + '%');
    w = $('#' + local_video_div_id).width();
    $('#' + vidId).css('width', 100 * $('#' + vidId).width()/w + '%');
    $('#' + canvasId).css('width', 100 * $('#' + vidId).width()/w + '%');
    $('.' + groupId).css('visibility', 'visible');
  } else {
    setTimeout(function() {
      kr.rtc.handleRemoteVideoPlaying(groupId, streamId,
       call_container_id, local_video_div_id, vidId, canvasId);
    }, 100);
  }
}


function handleCreateOfferError(event){
  console.log('createOffer() error: ', event);
}

function handleCreateAnswerError(event){
  console.log('createAnswer() error: ', event);
}

Rtc.prototype.requestTurn = function(turn_url) {
  var pc_config = {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};
  var turnExists = false;
  for (var i=0; i < pc_config.iceServers.length; i++) {
    if (pc_config.iceServers[i].url.substr(0, 5) === 'turn:') {
      turnExists = true;
      this.turnReady = true;
      break;
    }
  }
  if (!turnExists) {
    console.log('Getting TURN server from ', turn_url);
    // No TURN server. Get one from computeengineondemand.appspot.com:
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
      if (xhr.readyState === 4 && xhr.status === 200) {
        var turnServer = JSON.parse(xhr.responseText);
        console.log('Got TURN server: ', turnServer);
        pc_config.iceServers.push({
          'url': 'turn:' + turnServer.username + '@' + turnServer.turn,
          'credential': turnServer.password
        });
        this.turnReady = true;
      }
    };
    xhr.open('GET', turn_url, true);
    xhr.send();
  }
}


function handleRemoteStreamRemoved(event) {
  console.log('Remote stream removed. Event: ', event);

}

Rtc.prototype.hangup = function() {
  console.log('Hanging up.');
  this.stop();
  this.sendMessage('bye');
}

Rtc.prototype.handleRemoteHangup = function() {
  console.log('Session terminated.');
  this.stop();
}

Rtc.prototype.stop = function() {
}

/*Set Opus as the default audio codec if it's present.*/
Rtc.prototype.preferOpus = function(sdp) {
  var sdpLines = sdp.split('\r\n');
  var mLineIndex = null;
  // Search for m line.
  for (var i = 0; i < sdpLines.length; i++) {
      if (sdpLines[i].search('m=audio') !== -1) {
        mLineIndex = i;
        break;
      }
  }
  if (mLineIndex === null) {
    return sdp;
  }

  // If Opus is available, set it as the default in m line.
  for (i = 0; i < sdpLines.length; i++) {
    if (sdpLines[i].search('opus/48000') !== -1) {
      var opusPayload = this.extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
      if (opusPayload) {
        sdpLines[mLineIndex] = this.setDefaultCodec(sdpLines[mLineIndex], opusPayload);
      }
      break;
    }
  }

  // Remove CN in m line and sdp.
  sdpLines = this.removeCN(sdpLines, mLineIndex);

  sdp = sdpLines.join('\r\n');
  return sdp;
}

Rtc.prototype.extractSdp = function(sdpLine, pattern) {
  var result = sdpLine.match(pattern);
  return result && result.length === 2 ? result[1] : null;
}

/*Set the selected codec to the first in m line.*/
Rtc.prototype.setDefaultCodec = function(mLine, payload) {
  var elements = mLine.split(' ');
  var newLine = [];
  var index = 0;
  for (var i = 0; i < elements.length; i++) {
    if (index === 3) { // Format of media starts from the fourth.
      newLine[index++] = payload; // Put target payload to the first.
    }
    if (elements[i] !== payload) {
      newLine[index++] = elements[i];
    }
  }
  return newLine.join(' ');
}

/*Strip CN from sdp before CN constraints is ready.*/
Rtc.prototype.removeCN = function(sdpLines, mLineIndex) {
  var mLineElements = sdpLines[mLineIndex].split(' ');

  for (var i = sdpLines.length-1; i >= 0; i--) {
    var payload = this.extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
    if (payload) {
      var cnPos = mLineElements.indexOf(payload);

      if (cnPos !== -1) {
        // Remove CN payload from m line.
        mLineElements.splice(cnPos, 1);
      }
      // Remove CN line in sdp
      sdpLines.splice(i, 1);
    }
  }

  sdpLines[mLineIndex] = mLineElements.join(' ');
  return sdpLines;
}


Rtc.prototype.update = function(crate) {

  if (crate.ctrl == 'user_registered') {
    console.log("Received user_registered");
    this.userRegistered(crate.user);
  }

  if (crate.ctrl == 'user_unregistered') {
    console.log("Received user_unregistered");
    this.userUnregistered(crate.user);
  }

  if (crate.ctrl == 'call') {
    console.log('Received call', crate);
    kr.rtc.ring();
    $('#dialog').html("Answer incoming call from '" + crate.user + "'?");
    $('#dialog').dialog({
      autoOpen: true,
      buttons: {
        Ok: function() {
          for (var i = 0; i < kr.rtc.peers.length; i++) {
            if (kr.rtc.peers[i].name == crate.user) {
              kr.rtc.peers[i].connection.setRemoteDescription(
               new RTCSessionDescription({"sdp":crate.sdp, "type":"offer"}));
              kr.rtc.answerPeer(crate.user);
              break;
            }
          }
          $(this).dialog('close');
        },
        Cancel: function() {
          $(this).dialog('close');
        }
      }
    });

  } else if (crate.ctrl == 'answer') {
    console.log('Received Answer', crate);
    for (var i = 0; i < this.peers.length; i++) {
      if (this.peers[i].name == crate.user) {
        this.peers[i].connection.setRemoteDescription(
         new RTCSessionDescription({"sdp":crate.sdp, "type":"answer"}));
        break;
      }
    }
  } else if (crate.ctrl == 'candidate') {
    console.log('Received Candidate', crate);
    var candidate = new RTCIceCandidate({
     sdpMLineIndex: crate.label,
     candidate: crate.candidate
    });
    for (var i = 0; i < this.peers.length; i++) {
      if (this.peers[i].name == crate.user) {
        this.peers[i].handleIceCandidate(candidate);
      }
    }
  } else if (crate.message === 'bye') {
    this.handleRemoteHangup();
  }
}

Rtc.prototype.shared = function(key, shared_object) {
}






$(document).ready(function() {
  rack_units.push({'constructor': Uploader, 'aspect': [8,8], 'page': 1});
});

function Uploader(info_object) {
  this.title = "Uploader";
  this.description = "For file uploading.";
  this.aspect_ratio = [32,20];
  this.x = 0;
  this.y = 1;
  this.width = 0;
  this.height = 0;
  this.address_masks = [];
  this.id = 'uploader'
  this.div_text = "<div class='RCU uploader' id='" + this.id + "'></div>";
  this.sel = "#" + this.id;
  info_object['parent_div'].append(this.div_text);

  $(this.sel).append('\
   <div class="row">\
   <label for="fileToUpload">Select a File to Upload</label><br />\
   <div class="button_wrap"><div class="krad_button" id="proxyButton">\
   BROWSE</div></div>\
   <input type="file" name="fileToUpload"\
    id="fileToUpload" style="display:none" multiple="multiple"\
    onchange="fileSelected();"/>\
   <div class="row">\
   <div id="fileName"></div>\
   <div id="fileSize"></div>\
   <div id="fileType"></div></div> <div class="row">\
   <div class="button_wrap"><div class="krad_button"\
    onclick="uploadFile()">UPLOAD</div></div>\
   <div id="progressNumber"></div>');


   $('#proxyButton').bind("click", function(e) {
   fileElem = document.getElementById("fileToUpload");
   fileElem.click();

   e.preventDefault();
   return false;
  });

}

Uploader.prototype.update = function(crate) {
}

Uploader.prototype.shared = function(key, shared_object) {
}

function fileSelected() {
  var file = document.getElementById('fileToUpload').files[0];
  if (file) {
    var fileSize = 0;
    if (file.size > 1024 * 1024)
      fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
    else
      fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';

    document.getElementById('fileName').innerHTML = 'Name: ' + file.name;
    document.getElementById('fileSize').innerHTML = 'Size: ' + fileSize;
    document.getElementById('fileType').innerHTML = 'Type: ' + file.type;
  }
}

    function uploadFile() {
        var fd = new FormData();
        fd.append("fileToUpload", document.getElementById('fileToUpload').files[0]);
        var xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", uploadProgress, false);
        xhr.addEventListener("load", uploadComplete, false);
        xhr.addEventListener("error", uploadFailed, false);
        xhr.addEventListener("abort", uploadCanceled, false);
        xhr.open("POST", "UploadMinimal.aspx");
        xhr.send(fd);
      }

      function uploadProgress(evt) {
        if (evt.lengthComputable) {
          var percentComplete = Math.round(evt.loaded * 100 / evt.total);
          document.getElementById('progressNumber').innerHTML = percentComplete.toString() + '%';
        }
        else {
          document.getElementById('progressNumber').innerHTML = 'unable to compute';
        }
      }

      function uploadComplete(evt) {
        /* This event is raised when the server send back a response */
        alert(evt.target.responseText);
      }

      function uploadFailed(evt) {
        alert("There was an error attempting to upload the file.");
      }

      function uploadCanceled(evt) {
        alert("The upload has been canceled by the user or the browser dropped the connection.");
      }

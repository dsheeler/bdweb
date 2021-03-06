$(document).ready(function() {
  rack_units.push({'constructor': Rtc, 'aspect': [32,20], 'page': 1});
});

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

  this.oldData;

  this.isChannelReady;
  this.isInitiator = false;
  this.isStarted = false;
  this.videoActuallyPlaying = false;
  this.localStream;
  this.pc = null;
  this.remoteStream;
  this.turnReady;
  this.pc_constraints = {'optional': [{'DtlsSrtpKeyAgreement': true}]};
  this.remoteVideo;
  /*Set up audio and video regardless of what devices are present.*/
  this.sdpConstraints = {'mandatory': {
  'OfferToReceiveAudio':true,
  'OfferToReceiveVideo':true }};

  info_object['parent_div'].append(this.div_text);

  $(this.sel).append("\
  <div id='container'>\
  <div class='button_wrap'>\
  <div class='krad_button' id='start_media'>Chat</div>\
  </div>\
  <div id='videos'>\
    <canvas id='canvas'></canvas>\
    <video id='remoteVideo'  autoplay></video>\
    <video id='localVideo'  autoplay muted style='visibility:hidden'></video>\
  </div>\
  </div>");

  this.localVideo = document.querySelector('#localVideo');
  this.remoteVideo = document.querySelector('#remoteVideo');
  this.canvas = document.querySelector('#canvas');
  this.context = this.canvas.getContext('2d');
  this.back = document.createElement('canvas');
  this.backcontext = this.back.getContext('2d');

  this.localVideo.addEventListener('play', function() {
    draw(kr.rtc.localVideo, kr.rtc.context, kr.rtc.localVideo.clientWidth,
     kr.rtc.localVideo.clientHeight);
  });

  var room = location.pathname.substring(1);
  if (room === '') {
    room = 'foo';
  }

  $('#start_media').bind('click', function(e) {
    var room = location.pathname.substring(1);
    if (room === '') {
      room = 'foo';
    }

    if (room !== '') {
      console.log('Create or join room', room);
      var cmd = '{"rtc":"create_or_join","room":"' + room + '"}';
      kr.rtc_send(cmd);
    }

    if (location.hostname != "localhost") {
      kr.rtc.requestTurn('http://numb.viagenie.ca?username=dsheeler@pobox.com&key=V1mbm666');
    }

    kr.rtc.startMedia();
  });

  window.onbeforeunload = function(){
    console.log("SAYING GOODBYE");
    kr.rtc.sendMessage('bye');
  }

}

Rtc.prototype.startMedia = function() {
  var constraints = {video: true, audio: true};
  getUserMedia(constraints, handleUserMedia, handleUserMediaError);
  console.log('Getting user media with constraints', constraints);

}

Rtc.prototype.sendMessage = function(message) {
  console.log('Client sending message: ', message);
  if (typeof message === 'object') {
    message = JSON.stringify(message);
  }
  var cmd = '{"rtc":"message","message":"' + message + '"}';
  kr.rtc_send(cmd);
}

function handleUserMedia(stream) {
  console.log('Adding local stream.');
  if (kr.rtc.localVideo == null) {
    kr.rtc.localVideo = document.querySelector('#localVideo');
  }
  attachMediaStream(kr.rtc.localVideo, stream);
  kr.rtc.localStream = stream;
  kr.rtc.sendMessage('got user media');
  if (kr.rtc.isInitiator) {
    kr.rtc.maybeStart();
  }

}

var oldData;
var first = 1;

function draw(v,c,w,h) {

  try {
      if (kr.rtc.canvas.width != kr.rtc.localVideo.clientWidth) {
        kr.rtc.canvas.width = kr.rtc.localVideo.clientWidth;
        kr.rtc.canvas.height = kr.rtc.localVideo.clientHeight;
        kr.rtc.canvas.style.width = kr.rtc.localVideo.clientWidth +'px';
        kr.rtc.canvas.style.height = kr.rtc.localVideo.clientHeight + 'px';
      }
      c.drawImage(v,0,0,kr.rtc.canvas.width,kr.rtc.canvas.height);
      kr.rtc.canvas.style.MozAnimationPlayState = 'running';
      var imgData = c.getImageData(0, 0, kr.rtc.canvas.width,
       kr.rtc.canvas.height);
      var oldData = kr.rtc.oldData ? kr.rtc.oldData : imgData;
      for (var i=0;i<imgData.data.length;i+=4) {
        imgData.data[i]=oldData.data[i]-imgData.data[i];
        imgData.data[i+1]=oldData.data[i+1]-imgData.data[i+1];
        imgData.data[i+2]=oldData.data[i+2]-imgData.data[i+2];
        imgData.data[i+3]=255;
      }
      kr.rtc.oldData = c.getImageData(0,0,kr.rtc.canvas.width,kr.rtc.canvas.height);
      c.putImageData(imgData, 0, 0);
  } catch (e) {
    if (e.name != "NS_ERROR_NOT_AVAILABLE") {
      throw e;
    }
  }

  setTimeout(draw,20,v,kr.rtc.context,kr.rtc.canvas.width,kr.rtc.canvas.height);
}

function handleUserMediaError(error){
  console.log('navigator.getUserMedia error: ', error);
}

Rtc.prototype.maybeStart = function() {
  if (!this.isStarted && typeof this.localStream != 'undefined'
   && this.isChannelReady) {
    this.createPeerConnection();
    this.pc.addStream(this.localStream);
    this.isStarted = true;
    console.log('isInitiator', this.isInitiator);

  }
}

Rtc.prototype.createPeerConnection = function() {
  try
    {
      this.pc = new RTCPeerConnection(null);
      this.pc.onicecandidate = handleIceCandidate;
      this.pc.onaddstream = handleRemoteStreamAdded;
      this.pc.onremovestream = handleRemoteStreamRemoved;
      console.log('Created RTCPeerConnnection');
    } catch (e) {
      console.log('Failed to create PeerConnection, exception: ' + e.message);
      alert('Cannot create RTCPeerConnection object.');
      return;
  }
}

function handleIceCandidate(event) {
  console.log('handleIceCandidate event: ', event);
  if (event.candidate) {
    kr.rtc.sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate});
  } else {
    console.log('End of candidates.');
  }
}

function handleRemoteStreamAdded(event) {
  console.log('Remote stream added.');
  attachMediaStream(kr.rtc.remoteVideo, event.stream);
  kr.rtc.remoteStream = event.stream;
}

function handleCreateOfferError(event){
  console.log('createOffer() error: ', e);
}

function handleCreateAnswerError(event){
  console.log('createAnswer() error: ', e);
}

Rtc.prototype.doCall = function() {
  console.log('Sending offer to peer');
  this.pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

Rtc.prototype.doAnswer = function() {
  console.log('Sending answer to peer.');
  this.pc.createAnswer(setLocalAndSendMessage, handleCreateAnswerError, this.sdpConstraints);
}

function setLocalAndSendMessage(sessionDescription) {
  // Set Opus as the preferred codec in SDP if Opus is present.
  sessionDescription.sdp = kr.rtc.preferOpus(sessionDescription.sdp);
  kr.rtc.pc.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage sending message', sessionDescription);
  kr.rtc.sendMessage(sessionDescription);
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
  this.isInitiator = true;
  this.maybeStart();
}

Rtc.prototype.stop = function() {
  this.isStarted = false;
  if (this.pc != null) this.pc.close();
  this.pc = null;
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

  if (crate.ctrl == 'created') {
    console.log('First!');
    this.isInitiator = true;
  }

  if (crate.ctrl == 'joined') {
    console.log('This peer has joined');
    this.isChannelReady = true;
  }

  if (crate.ctrl == 'message') {
    console.log('Client received message:', crate.message);
    if (crate.message === 'got user media') {
      if (this.isInitiator) {
        this.doCall();
      }
    } else if (crate.message.type === 'offer') {
      if (this.pc == null || (!this.isInitiator && !this.isStarted)) {
        this.maybeStart();
      }
      if (this.pc != null) {
        this.pc.setRemoteDescription(new RTCSessionDescription(crate.message));
        this.doAnswer();
      }
    } else if (crate.message.type === 'answer' && this.isStarted) {
      this.pc.setRemoteDescription(new RTCSessionDescription(crate.message));
    } else if (crate.message.type === 'candidate' && this.isStarted) {
      var candidate = new RTCIceCandidate({
        sdpMLineIndex: crate.message.label,
        candidate: crate.message.candidate
      });
      this.pc.addIceCandidate(candidate);
    } else if (crate.message === 'bye') {
      this.handleRemoteHangup();
    }
  }
}

Rtc.prototype.shared = function(key, shared_object) {
}







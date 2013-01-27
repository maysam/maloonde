var socket = io.connect();
var urls = []
socket.on('status', function (data) {
	urls = data
	reload()
});
function delete_link(index) {
	socket.emit('delete', { index: index })
}
function reload () {
	if (urls.length == 0) {
		$('#urls').hide()
	} else {
		$('#urls tbody').empty()
		for (var i = 0; i < urls.length; i++) {
			var tr = $('<tr>')
			tr.append($('<td>').text(urls[i].link))
			tr.append($('<td>').append($('<p>').text(urls[i].status).addClass('status ' + urls[i].status)))
			tr.append($('<td>').text(urls[i].rt))
			tr.append($('<td>').append($('<a>').attr('href','#').text('delete').click(function (a) {
				return function() {
					delete_link(a)
				}
			}(i))).addClass('delete-button'))
			$('#urls tbody').append(tr)
		};
		$('#urls').show()
	}
}
$(function() {
  $('.submit-button').click(function () {
  	if ($('#website_address').val() != '') {
		socket.emit('add', { website_address: $('#website_address').val() });
		$('#website_address').val('')
  	}
  })  	
  reload()
  socket.emit('add', { website_address: 'http://www.google.com' });
  socket.emit('add', { website_address: 'http://www.yahoo.com' });
  socket.emit('add', { website_address: 'http://www.internet.com' });
  socket.emit('add', { website_address: 'http://www.irna.com' });
  $(document).keypress(function(e) {
	    if(e.which == 13) {
	        $('.submit-button').click()
	    }
	});
})

/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index', { title: 'Url Health Monitoring System' });		
 };
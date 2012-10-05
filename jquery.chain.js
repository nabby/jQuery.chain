(function ($) {
	var is_set = function (v) 
	{ 
		return !(typeof v == 'undefined'); 
	};
	
	var is_type = function (v, type)
	{
		if (v === null) return false;

		var t = type.toLowerCase();

		switch (t)  {
		case 'array':
			return v.constructor == Array;
		case 'object':
		case 'function':
			return (typeof v == t);
		case 'deferred':
			return is_type(v, 'object') && is_set(v.done);
		default:
			throw 'is_type(): unrecognized type "' + type + '"';
		}
	};

	$.chain = function (queue, dfr, args)
	{
		if (!is_set(dfr)) dfr = $.Deferred();
		if (!is_set(args)) args = [];

		var r;	
		var t = queue.splice(0, 1)[0];
		if (!is_type(t, 'array')) t = [t];

		if (is_type(t[0], 'function')) {
			var fn = t[0];
			var scope = (is_set(t[1])) ? t[1] : null;
		
			r = fn.apply(scope, args);
		}
		else r = t[0];

		if (is_type(r, 'deferred')) {
			r.done(function() {
				if (queue.length > 0)
					$.chain(queue, dfr, arguments) 
				else dfr.resolve(arguments);
			});
			r.fail(function() { dfr.reject.apply(dfr, arguments); });
		}
		else {
			if (queue.length > 0)
				$.chain(queue, dfr, [r]) 
			else dfr.resolve(r);
		}
		
		// need true recursive delete here?
		t = r = null;
	
		return dfr.promise();
	}
})(window.jQuery);	

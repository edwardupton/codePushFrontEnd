//needs to link to the number of environments
var stages = 5;

Keen.onChartsReady(function() {

  var chartLayout = {
		height: "300px",
		width: "360px",
		showLegend: false
	}

	var chartToday = {
	    analysisType: "count",
	    timeframe: "this_day",
	    interval: "hourly"
	}

	var filterWithFeature = {
	        "property_name" : flagName,
	        "operator" : "eq",
	        "property_value" : true
	}

	var filterWithoutFeature = {
	        "property_name" : flagName,
	        "operator" : "eq",
	        "property_value" : false
	    }

	var filterEnvironment = {
			"property_name" : "environment",
	        "operator" : "eq",
	        "property_value" : environment
	}

	//calculates Keen metrics
	var getConversionImprovement = function(flagName,metric,pageTitle,environment,timeframe) {
		var metricWith = getMetric (filterWithFeature)
		var metricWithout = getMetric (filterWithoutFeature)
		var pageViewsWith = getPageviews (filterWithFeature)
		var pageViewsWithout = getPageviews (filterWithoutFeature)
		var conversionWithFeature = metricWith / pageViewsWith;
		var conversionWithoutFeature = metricWithout / pageViewsWithout;

		return conversionWithFeature - conversionWithoutFeature;

		var getMetric = function (filterFeature) {
			var filters = $.extend(filterEnvironment,filterFeature)
			var metric = new Keen.Metric(flagName, {
		        analysisType: "count",
		        timeframe: timeframe,
		        filter: filters
	    	});
			return metric
		}

		var getPageviews = function (filterFeature) {
			var filters = $.extend(filterEnvironment,filterFeature)
			var pageviews = new Keen.Metric("PageView", {
		        analysisType: "count",
		        targetProperty: "page." + pageTitle,
		        timeframe: timeframe,
		        filter: filters
		    });
			return pageviews;
		}
	}


	

	

	var drawChart = function (metric,flagName,environment,filterTrue) {
		var filterArray = new Array()
		if (filterTrue) {
			var filterFeature = filterWithFeature;
			var filterWord = 'with'
		}
			else {
					var filterFeature = filterWithoutFeature;
					var filterWord = 'without'
				}
		filterArray.push(filterFeature,filterEnvironment)
    	var metricFilters = {filter: filterArray}
		var keenMetrics = $.extend(chartToday,metricFilters)
    	var series = new Keen.Series(metric, keenMetrics)
   		var lineChart = new Keen.LineChart(series,
    		$.extend(chartLayout,{title: metric + " today " + filterWord + " " + flagName})
    	);
    	$('#graph-container').append('<div id="graph-' + metric + '-' + filterWord + '" />');
		lineChart.draw(document.getElementById("graph-" + metric + "-" + filterWord));
	}


});


//calls the popup with charts
var modalPopup = function(flagName,environment,graphMetrics) {
	$('#graph-modal').modal('show');
	for (var i = 0; i < graphMetrics.length; i++) {
		drawChart (graphMetrics[i],flagName,environment,false)
		drawChart (graphMetrics[i],flagName,environment,true)		
	};
}

$(document).ready(function() {

	var sliderWidth = $(".slider-span").width();
	var columnWidth = (sliderWidth / stages) - 20;
	$(".slider-container").css({
		'margin-left' : (columnWidth / 2) - 8,
		'margin-right': (columnWidth / 2) + 20
	})
	
	$(".grey-column").width(columnWidth);
	
	$( ".slider-container" ).slider({
		min: 1,
		max: stages,
		range: false,
	});
	
	$(".ui-slider").css({
		'background' : 'transparent'	
	})
	
	$(".ui-slider-handle").css({
		'height' :'2em',
		'width' : '2em',
		'top' : '-0.6em',
		'margin-left' : '-.6em'	
	})
	
	$(".error .slider-container").slider('disable');
	
	$("#feature2 .slider-container").slider({value:4});
	
	var popoverSettings = {
		placement: 'right',
		animation: true,
		trigger: 'hover',
		delay: 200,
		html: true
	}

	var feature2popover = 
	"Signups:" + getConversionImprovement("submit-btn","Signups","staging","today")
	+ "<br/>Blog posts:" + getConversionImprovement("submit-btn","Microblogs","staging","today");

	$('#feature1 .ui-slider-handle')
		.css({'background-color' : 'red', 'background-image' : 'none'})
		.popover($.extend(popoverSettings,{
			title:'Failed Integration',
			content: '26-Jan-13'
		}));

	$('#feature2 .ui-slider-handle')
		.css({'background-color' : 'green', 'background-image' : 'none'})
		.popover($.extend(popoverSettings,{
			title:'Metrics look good',
			content: feature2popover
		}));

	$('#feature2 .ui-slider-handle').dblclick(modalPopup("submit-btn","staging",["Signups","Microblogs"]));
	$('#feature2 .feature-link').click(modalPopup("submit-btn","staging",["Signups","Microblogs"]));

	if ($( "#feature2 .slider-container" ).slider( "option", "value" ) < 4) {
		$('#feature2 .ui-slider-handle')
			.css({'background-color' : 'grey'})
			.popover('hide')
	};

});

console.log("Hello Joe!");
console.log("Hello Dane!");

/**
 * List of initial thoughts
 * 
 * Syntax: should use modern syntax (let/const instead of var)
 * make sure we are ending our expressions with semi-colons
 * 
 * Design: we need to arrange this in a Class instead of functions
 * I think most of this could be wrapped in a class with points as fields- the points could be
 * passed in as params (instantiated with an array of point objects) - functions then become methods
 * of class
 * 
 */

// A point
// Make class - in seperate file
var point = function(x, y){
	this.x = x
	this.y = y
	
}

points = [] //main point array

/*var p1 = new point(-3,12)
var p2 = new point(2, 5)
var p3 = new point(4, 7)
var p4 = new point(9, 7)
var p5 = new point(16, -1)
var p6 = new point(40, 15)

points = [p1, p2, p3, p4, p5, p6]*/

var p1 = new point(-3,1)
var p2 = new point(2,5)
var p3 = new point(4,7)
var p4 = new point(9,7)

points = [p1, p2, p3, p4]

// Do a check that differences in adjacent x-coordinates do not equal 0
// causing division by zero later.
var check = function(points){
	
}

// Create an equation from arrays with one more element than the number
// of points. If there are n points then there are n + 1 elements in the
// left and right arrays. The positions 1,2,...n are for n variables and 
// the n + 1 position holds the constant term.
var eq = function(points) {
	this.id = 0
	this.l = [] //left side of equation
	this.r = [] //right side of equation
	this.terms = points.length
	
	this.buildLinearEquation = function(){
		for (var i = 0; i <= this.terms; i++){
			this.l.push(0)
			this.r.push(0)
		}
	}
	
	this.copyEquation = function(){
		copy = new eq({})
		for (var i = 0; i < this.l.length; i++){
			copy.l.push(this.l[i])
		}
		for (var i = 0; i < this.r.length; i++){
			copy.r.push(this.r[i])
		}
		copy.id = this.id
		copy.terms = this.terms
		return copy
	}	
	
	
}


// Creates a system of linear equations
var System = function(points) {
	
	this.equations = []	
	
	this.initSystem = function(){
		for (var i = 0; i < points.length; i++){
			var equation = new eq(points)
			equation.id = i
			equation.buildLinearEquation()
			this.equations.push(equation)
		}
	}
	
	
	this.cubicSplineCoefficients = function(){
		
		var d = []
		d.push(0)
		for (var i = 0; i < points.length - 2; i++){
			var term1 = (points[i+2].y - points[i+1].y)/
						(points[i+2].x - points[i+1].x)
						
			var term2 = (points[i+1].y - points[i].y)/
						(points[i+1].x - points[i].x)
						
			var dValue = 6 * (term1 - term2)
			
			d.push(dValue)
		}
		d.push(0)
		
		//console.log(d)
		
		for (var i = 0; i < points.length; i++) {
			
			if (i == 0) {
				
				this.equations[i].l[0] = 1
				
				for (var j = 1; j < points.length; j++){
					this.equations[i].l[j] = 0
				}
				
				this.equations[i].r[points.length] = 0
			}
			else if (i == 1) {
				
				this.equations[i].l[0] = 0
				this.equations[i].l[1] = 2 * (points[2].x - points[0].x)
				this.equations[i].l[2] = points[2].x - points[1].x
				this.equations[i].r[points.length] = d[1]
			}
			else if (i < points.length - 1){
				this.equations[i].l[i-1] = points[i].x - points[i-1].x
				this.equations[i].l[i] = 2 * (points[i+1].x - points[i-1].x)
				this.equations[i].l[i+1] = points[i+1].x - points[i].x
				this.equations[i].r[points.length] = d[i]
			}
			else if (i == points.length - 1){
				
				this.equations[i - 1].l[i] = 0 // the last variable is 0
				// in second to last equation since ti = 0
								
				for (var j = 0; j < points.length - 1; j++){
					this.equations[i].l[j] = 0
				}
				this.equations[i].l[i] = 1
				
				this.equations[i].r[points.length] = 0
				
			}
			else{
				console.log("Error: Index out of range for" +
							"Cubic Spline Coefficients")
			}
			
		}
	}
	
	
}




var SolveCubicSplineLinearSystem = function(equations){
	var solutions = []
	var solutionSet = []
	
	// Copy the contents of equations array into solutions array...
	solutions.push(equations[0].copyEquation())
		
	for (var i = 1; i < equations.length; i++){
		for (var j = 0; j <= equations.length; j++){
			if (j != i){
				// negate and combine l-hand coefficients with r-hand side
				equations[i].r[j] = equations[i].r[j] - equations[i].l[j]
				equations[i].l[j] = 0
			}
		}
		
		// divide r-hand side by ith variable coefficient
		for (var j = 0; j <= equations.length; j++){
			if (equations[i].l[i] != 0){
				equations[i].r[j] = equations[i].r[j]/equations[i].l[i]				
			}
		} 
		
		//Division by ith coefficient complete
		equations[i].l[i] = 1 
		
		// Next complete substitution of variables into equation i + 1
		// But first save solution
		solutions.push(equations[i].copyEquation())
		
		// Multiply by ith coeffiecient in equation i + 1
		// Then add each r-hand coefficient in equation i to l-hand
		// in equation i + 1
		for (var j = 0; j <= equations.length; j++){
			if (i < equations.length - 1){
				equations[i].r[j] = equations[i+1].l[i]*equations[i].r[j]
				equations[i+1].l[j] = equations[i+1].l[j] + equations[i].r[j]
				if (j == equations.length){
					equations[i+1].l[i] = 0
				}
			}
		}
				
	}
		
	// Back-substitution to solve for solution set. Iterate through system of
	// equations in reverse order and substitute known variables. Set first
	// solution to zero (first and last coefficients are zero for natural 
	// cubic spline interpolation).
	
	solutionSet.push(0)
	
	for (var i = solutions.length - 1; i > 0; i--){
		var solution = solutions[i].r[solutions.length]*solutions[i-1].r[i] + 
			solutions[i-1].r[solutions.length]
		solutionSet.push(solution)
		
	}
	solutionSet.reverse() // reorder the solution set
	
	//console.log(equations)
	console.log(solutions)
	console.log(solutionSet)
	
	return solutionSet // array of solved coefficients to create cubic eq
}


// Create temporary cubic spline equations from the solved coefficients (t),   
// original points array (p), and the change in x (dx) from which to sample 
// values from these cubic equations. Then fill in the dataSets array with 
// those points. X-cooridinates of points must be ordered.
var produceDataSetsFromCubicEquations = function(t, p, dx){
	var dataSets = []
	var x = 0
	var y = 0
	var value1 = 0
	var value2 = 0
	var value3 = 0
	
	for (var i = 1; i < t.length; i++){
		dataSets.push([])
		x = p[i-1].x 
		
		while (x < p[i].x){
			value1 = t[i-1]*Math.pow(p[i].x - x, 3) + t[i]*Math.pow(x - p[i-1].x, 3)
			value1 = value1/(6*(p[i].x - p[i-1].x))
			value2 = p[i].y*(x - p[i-1].x) + p[i-1].y*(p[i].x - x)
			value2 = value2/(p[i].x - p[i-1].x)
			value3 = t[i]*(x - p[i-1].x) + t[i-1]*(p[i].x - x)
			value3 = value3*(p[i].x - p[i-1].x)
			value3 = -value3/6
			
			// Add the three quantities to get the y value
			y = value1 + value2 + value3
			
			dataSets[i-1].push(new point(x, y))
			x += dx
		}
	}
	
	//console.log(dataSets)
	return dataSets
	
}


// Testing to graph data to canvas
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d')
var width = ctx.canvas.width
var height = ctx.canvas.height
var cw = width/2
var ch = height/2

var graphDataSet = function(data, points){
	
	ctx.fillStyle="rgba(0,0,0)"
	for (var i = 0; i < data.length; i++){
		for (var j = 0; j < data[i].length - 1; j++){
			ctx.beginPath();
			ctx.moveTo(data[i][j].x * 16 + 100, ch - data[i][j].y * 12 )
			ctx.lineTo(data[i][j+1].x * 16 + 100, ch - data[i][j+1].y * 12)
			ctx.stroke()
			
			
		}
		
	}
	
	ctx.fillStyle="rgba(255,0,0)"
	for (var i = 0; i < points.length; i++){
		ctx.beginPath()
		ctx.arc(points[i].x * 16 + 100, ch - points[i].y * 12, 10, 0, 2*Math.PI)
		ctx.closePath()
		ctx.fill()
	}
	
}



var s = new System(points)
s.initSystem()
s.cubicSplineCoefficients()

var t = SolveCubicSplineLinearSystem(s.equations)
var dataSet = produceDataSetsFromCubicEquations(t, points, 0.1)
graphDataSet(dataSet, points)





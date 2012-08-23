(function() {
	window.badMonkey = (function(){
		var framerate = 20,
			gravityX= 0,
			gravityY = 10,
			ppm = 30;
		var camLook = false;
		
		
		var base, myworld;
		var called = false;
		var defaultworld;
		var circle;
		var circleInitPos;
		var man;
		var deleted = false;
		var g,s,x,y;
		var spark;
		var mon, mon1;
		
		var getit = true;
		
		var curPos=0;
		var cams = 0;
		
		function objectSize(object) {		
		  var object_size = 0;
		  for (key in object){
			if (object.hasOwnProperty(key)) {
			  object_size++;
			}
		  }
		  return object_size;
		}
		
		var sparkleMap=[];		
		var imgfrm = {
			//0 : 'img/sparkle_21x23.png',
			0 : 'img/leaf.png',
			1 : 'img/sparkle_red_21x23.png',
			2 : 'img/sparkle_y_21x23.png'
		}
		
		var data = {
			images: [imgfrm[Math.floor(Math.random()*2)]],
			frames: {width:21,height:23,regX:10,regY:11}
		}
		
		
		function addSparkles(count, x, y, speed) {
			var num = Math.floor(Math.random()*10) % 3 ;
			
			
			//create the specified number of sparkles
			for (var i=0; i<count; i++) {
				// clone the original sparkle, so we don't need to set shared properties:
				var dats = {
					images: [imgfrm[num]],
					frames: {width:21,height:23,regX:10,regY:11}
				}
				var abmp = new BitmapAnimation(new SpriteSheet(dats));
				var sparkle = abmp.clone();

				// set display properties:
				sparkle.x = x;
				sparkle.y = y;
				//sparkle.rotation = Math.random()*360;
				sparkle.alpha = Math.random()*0.5+0.5;
				sparkle.scaleX = sparkle.scaleY = Math.random()+0.3;

				// set up velocities:
				var a = Math.PI*2*Math.random();
				var v = (Math.random()-0.5)*30*speed;
				sparkle.vX = Math.cos(a)*v;
				sparkle.vY = Math.sin(a)*v;
				sparkle.vS = (Math.random()-0.5)*0.2; // scale
				sparkle.vA = -Math.random()*0.05-0.01; // alpha

				// start the animation on a random frame:
				sparkle.gotoAndPlay(Math.random()*sparkle.spriteSheet.getNumFrames()|0);

				// add to the display list:
				base.world.easelStage.addChild(sparkle);				
				// add to the sparkle array
				sparkleMap.push(sparkle);				
			}
		}

	
		

		
		//____________________________________________________________________________________________________
		
		var objMap={}; 
	
		
		var items = [
			{ userData: 'ground1', type:'static', widthPixels: 3200, heightPixels: 2, xPixels:0, yPixels: 600 },
			{ userData: 'ground2', type:'static', widthPixels: 2, heightPixels: 1200, xPixels:1600+800, yPixels: 0 },
			{ userData: 'ground3', type:'static', widthPixels: 2, heightPixels: 1200, xPixels:0, yPixels: 0 },
			{ userData: 'Ball', type: 'static', imgSrc: 'img/ball.png', radiusPixels: 15, xPixels: 120, yPixels: 600-90, angleRadians: 45, angularVelRadians: 2, density: 4, restitution: .5 }
		];
		
	
		var ourChar = {
			mike : {
				images: ['img/man.png'],
				frames: {width:120,height:128,regX:60,regY:63},
				animations: {
					throw: [0, 4, false, 2],					
					idle: [4, 4],
					normal: [0, 0]
				}
			}
		};
		
		var projTile = {
			images: ['img/projectile.png'],
			frames: {width:24,height:98,regX:12,regY:98},
			animations: {
				a: [0, 0],
				b: [1, 1],
				c: [2, 2],
				d: [3, 3],
				e: [4, 4],
				f: [5, 5]				
			}
		};
		
		
		
		// var circle= newworld.addEntity({
					// type: 'static',
					// widthPixels: 20,				
					// heightPixels: 20,				
					// xPixels: 120,
					// yPixels: canvas.height-90,
					// angleRadians: 45,
					// angularVelRadians: 2,
					// density: 6,
					// restitution: .9						
				// });
		var camFollow = false;
		var camTarget={};		
		var backtopav = false;
		var mike;
	
		var myBadMonkey = {			
			// add multiple obj -> world
			addToWorld : function(arr){
				for (var i in arr){
					this.appendBody(arr[i]);					
				}		
			},
			 
			// add single obj -> world 
			appendBody : function(opts){
				var object = base.world.addEntity(opts);
				objMap[opts.userData] = object;				
			},
			
			follow : function(obj){
				
				//var travel = obj.target.easelObj.x - obj.initPos;
				var travel = obj.target.easelObj.x - obj.initPos;
				var startFrom = 400;
				if(travel > startFrom && travel< 800){
					
					base.world.easelStage.x = startFrom - travel;
				}
				
			
				
			},
			
			backfollow : function(){
				if(base.world.easelStage.x <0)
					base.world.easelStage.x = cams + 10;
			
			},
			
			removeBody : function(obj){
				var data = obj.body.GetUserData();
				delete objMap[data]; // del frm map
				base.world.removeEntity(obj); // del frm world
			},
			colliderContactName : [],
			
			removeCollideBody : function(obj){
				if(obj!=undefined){					
					addSparkles(Math.random()*200+100|0, obj.easelObj.x, obj.easelObj.y, 2);					
					this.colliderContactName.push(obj);
				}
			}
		};
		
		
		
		// fruits all kinds of 
		var fruits = function() {
				
			this.fruitsOnAir = false,	// is fruits on air or ground
			
			this.fruitsRelease = false,
			
			this.init = function(that){
				
				this.addEvent(that);
			}
		}
		
		fruits.prototype.destroyFruit = function(name){
			setTimeout(function(){
				myBadMonkey.removeBody(name);
				backtopav= true;
			}, 5000);		
		};
		
		fruits.prototype.addEvent = function(target){
			var that = this;
			target.easelObj.onPress = function(e){
				target.initPositionXpixels = e.stageX;
				target.initPositionYpixels = e.stageY;
				
				e.onMouseMove= function (event){						
						var mouseX = event.stageX;
						var mouseY = event.stageY;	
						
						// target.setState({
							// xPixels: mouseX,
							// yPixels: mouseY,
							// userData: 'Ball'
						// });	
						// totalDist = (x1-x2)^2 + (y1-y2)^2
						var distanceX = mouseX-target.initPositionXpixels;
						var distanceY = mouseY-target.initPositionYpixels;
						
						var arrowAngle = Math.atan2(distanceY,distanceX);						
						var degrees = Math.round((arrowAngle*180/Math.PI));
						var euclidDist = distanceX*distanceX+distanceY*distanceY;
						// s.rotation = degrees-90;
						s.animation.rotation = degrees-90;
						//console.log(euclidDist);						
						
						if (euclidDist>150) {
							s.animation.gotoAndPlay("b");
						}
						if(euclidDist>300){							
							s.animation.gotoAndPlay("c");
						}
						if(euclidDist>600){							
							s.animation.gotoAndPlay("d");
						}
						if(euclidDist>1200){
							s.animation.gotoAndPlay("e");
						}
						if(euclidDist>2400){
							s.animation.gotoAndPlay("f");
						}
						
						
						
						// console.log(s.rotation);
						// if (distanceX*distanceX+distanceY*distanceY>10000) {
							// var birdAngle = Math.atan2(distanceY,distanceX);
							
							// target.setState({
								// xPixels: target.initPositionXpixels+100*Math.cos(birdAngle),
								// yPixels: target.initPositionYpixels+100*Math.sin(birdAngle),
								// userData: 'Ball'
							// });	
							
						// }
					
				};
				
				e.onMouseUp = function(event){
					var forceX, forceY;
					target.setType("dynamic");
					
					forceX = (target.initPositionXpixels - event.stageX) * 1;
					forceY = (target.initPositionYpixels - event.stageY) * 1;
					target.body.ApplyImpulse(base.world.vector(forceX, forceY), base.world.vector(target.body.GetPosition().x, target.body.GetPosition().y));
					
					that.fruitsOnAir = true; 
					
					if(mike.isInIdleMode){
						mike.animation.gotoAndPlay("throw");						
					}
					
					s.animation.gotoAndPlay("a");					
					
					if(!this.fruitsRelease){
						setTimeout(function (){								
							that.fruitsRelease = true;
							var newMonkey = {};
							var a = Math.random() * 10, b = Math.random() * 20;
							var id = "ball_"+a+b;
							newMonkey = items[3];							
							newMonkey.userData = id;
							myBadMonkey.appendBody(newMonkey);
							var monkey = new fruits();
							var circle = objMap[id];
							monkey.init(circle);
							that.destroyFruit(target);
							mike.animation.gotoAndPlay("normal");	
							
						}, 2000);			
					}
					camFollow = true;
					camTarget.target = target;
					camTarget.initPos = target.easelObj.x;
				};
			}
		}  
		
		
		// our brave boys
		
		var littleBoys = function(data, stage){
			this.animation;
			this.isInIdleMode = true;
			this.spriteData = {};
			this.init = function(){
				this.spriteData = data;
				this.animation = new BitmapAnimation(new SpriteSheet(this.spriteData));				
				stage.addChild(this.animation);								
			};
			this.init();
		};
		
		var projectile = function(data, stage){
			this.spriteData = {};
			this.init = function(){
				this.spriteData = data;
				this.animation = new BitmapAnimation(new SpriteSheet(this.spriteData));				
				stage.addChild(this.animation);								
			};
			this.init();
		};
		

		function badMonkey(canvas, debugCanvas){
			base = this;
			base.world = new EaselBoxWorld(this, framerate, canvas, debugCanvas, gravityX, gravityY, ppm);
			
			
			
			var nature = base.world.addImage("img/sky.jpg");
			//var catapult = base.world.addImage("img/catapult.png", {x: 100, y: canvas.height -99});
			var wood = base.world.addImage("img/tree.png", {x: 450, y: 110});
			
			mike = new littleBoys(ourChar.mike, base.world.easelStage);			
			mike.animation.x = 170;
			mike.animation.y = 510;
			mike.animation.gotoAndPlay("normal");
			
		
			
			myBadMonkey.addToWorld(items);
			
			circle = objMap['Ball'];
			
			var ourFruit = new fruits();
			ourFruit.init(circle);
			
			//myBadMonkey.throwIt(circle);
			
			circleInitPos = circle.easelObj.x;
			
			
			
			var bg = base.world.addImage("img/ground.png", {x:0, y: canvas.height - 48}); 
			
			//myBadMonkey.littleBoys.place(obj);
			
			
			// draw a line / rect 
			
			s = new projectile(projTile, base.world.easelStage);
			s.animation.x = 120;
			s.animation.y = 510;			
			// s = new Shape();
			// s.x = 120;
			// s.y = 510;			
			// g = s.graphics;
			// g.beginFill('#ff00dd');			
			// g.setStrokeStyle(5, "round", "round")
			// g.beginStroke("#ff00dd");
			// g.moveTo(0, 0).lineTo(0, 100);		
			// s.regY = 100;
			
			// base.world.easelStage.addChild(s);
			
			nature.onPress = function(event){
			
				
			
				// var deltaTime = event.stageX;
				// var baseDelta = base.easelStage.x;
				
				// event.onMouseMove = function(e){ 
					// if(curPos > -1050 && curPos <= 0){
						// curPos = baseDelta - (deltaTime - e.stageX);
					// }else if(curPos < -1050){
						// curPos = -1040;
					// }else{
						// curPos = 0;
					// }	
				// };
				
				
				
			};
			

			
			
			
			// addmouseevent to the Ball
			// if mouseup remove mouseevent from the Ball1 
				// fire setTimeout for new Ball2 to place
				// add Events to that Ball2
			
			// if no collision with ball settimeout for removeBall 
			// else remove timeout for removeBall 
			
			
			
			
			for(var i=0; i<2; i++){
				var x = 35;
				var y = 70;
				myBadMonkey.appendBody({
					userData: 'grab_'+i, 
					type: 'static', 
					imgSrc: 'img/monkey1.png', 
					widthPixels: 35, 
					heightPixels: 70,
					xPixels: 500 + y,
					yPixels: 300 + i*(x+y)					
				});
				
			}
				
			console.log(objMap);
			
			//, xPixels: 600, yPixels: 300 
			
			// var crate = this.world.addEntity({
				// type: 'dynamic',
				// widthPixels: 120,
				// heightPixels: 105,
				// xPixels: 1600 - 120,
				// yPixels: 600 - 105,
				// imgSrc: 'img/crate.png',
				// userData: 'crate'
			// });
			
			// man = this.world.addEntity({
				// type: 'static',
				// widthPixels: 35,
				// heightPixels: 70,
				// xPixels: 600,
				// yPixels: 300,
				// imgSrc: 'img/monkey1.png',
				// userData: 'mon1',
				// regX: 17
			// });
			
			
			// var man2 = this.world.addEntity({
				// type: 'static',
				// widthPixels: 35,
				// heightPixels: 70,
				// xPixels: 550,
				// yPixels: 200,
				// imgSrc: 'img/monkey4.png',
				// userData: 'mon1',
				// regX: 17
			// });
			
			// var man2 = this.world.addEntity({
				// type: 'static',
				// widthPixels: 35,
				// heightPixels: 70,
				// xPixels: 670,
				// yPixels: 350,
				// imgSrc: 'img/monkey4.png',
				// userData: 'mon1',
				// regX: 17
			// });
			
			// var man2 = this.world.addEntity({
				// type: 'static',
				// widthPixels: 35,
				// heightPixels: 70,
				// xPixels: 700,
				// yPixels: 230,
				// imgSrc: 'img/monkey1.png',
				// userData: 'mon1',
				// regX: 17
			// });
			
			// var crate1 = this.world.addEntity({
				// type: 'dynamic',
				// widthPixels: 129,
				// heightPixels: 129,
				// xPixels: 1600 - 120,
				// yPixels: 600 - 120 - 129,
				// imgSrc: 'img/crate1.jpg',
				// userData: 'crate1'
			// });
			
			// var crate2 = this.world.addEntity({
				// type: 'dynamic',
				// widthPixels: 120,
				// heightPixels: 120,
				// xPixels: 1600 - 240,
				// yPixels: 600 - 120 - 129,
				// imgSrc: 'img/crate.jpg',
				// userData: 'crate2'
			// });
			
			// var man1 = this.world.addEntity({
				// type: 'dynamic',
				// widthPixels: 88,
				// heightPixels: 80,
				// xPixels: 1600 - 120,
				// yPixels: 600/2 - 50,
				// imgSrc: 'img/monkey2.png',
				// userData: 'monstad'
			// });
			
			// mon1 = this.world.addEntity({
				// type: 'static',
				// widthPixels: 66,
				// heightPixels: 149,
				// xPixels: 1600 - 320,
				// yPixels: 600/2 - 50,
				// imgSrc: 'img/monkey3.png',
				// userData: 'man'
			// });
			
			
			
			
			base.world.addContactListener({
				BeginContact: function(idA, idB) {						
				  if(idA == "grab_0"){// && idB == "Ball"//
					deleted = true;
					myBadMonkey.removeCollideBody(objMap['grab_0']);					
					$('.score').html(parseInt($('.score').html())+Math.floor(Math.PI*2*Math.sqrt(objectSize(objMap))));
				  }if(idA=="grab_1"){// && idB == "Ball"//
					deleted = true;	
					myBadMonkey.removeCollideBody(objMap['grab_1']);					
					$('.score').html(parseInt($('.score').html())+Math.floor(Math.PI*2*Math.sqrt(objectSize(objMap))));
				  }		  
				}
			});
			
		
		};

		badMonkey.prototype.addSparkle = function(spX, spY, xVel, yVel) {
		  spark = this.world.addEntity({
			radiusPixels: 4,
			scaleX: 25,
			scaleY: 25,
			imgSrc: 'img/sparkle_21x23.png',
			frames: {
			  width: 21,
			  height: 23,
			  regX: 10,
			  regY: 11
			},
			startFrame: Math.random() * 13,
			xPixels: spX,
			yPixels: spY,
			xVelPixels: xVel,
			yVelPixels: yVel
		  });
		};
		
	
		
		
		badMonkey.prototype.tick = function() {
			if(camFollow){
				myBadMonkey.follow(camTarget);
			}
			
			if(backtopav){
				cams = base.world.easelStage.x;
				myBadMonkey.backfollow();
			}
			
			//console.log(sparkleMap.length);
			
			var l = sparkleMap.length;
			if(l){				
				for (var i=l-1; i>=0; i--) {
					var sparkle = sparkleMap[i];

					
					sparkle.vY += 2;
					sparkle.vX *= 0.98;
					
					sparkle.x += sparkle.vX;
					sparkle.y += sparkle.vY;
					sparkle.scaleX = sparkle.scaleY = sparkle.scaleX+sparkle.vS;
					sparkle.alpha += sparkle.vA;				
					if (sparkle.alpha <= 0 || sparkle.y > canvas.height) {
						base.world.easelStage.removeChild(sparkle);						
						sparkleMap.splice (i,1);
						//delete sparkleMap[i];												
					}
				}
			}
			
			
			
			
			// if(camLook){
				// if(travel < 900 && travel > 1){
					// base.easelStage.x = 0 - travel;
					// curPos = base.easelStage.x
				// }
				// if(travel>900){
					// camLook = false;
				// }
			
			// }else{
				// base.easelStage.x = curPos;
			// }
			
			if(deleted){		
				if(myBadMonkey.colliderContactName.length){
					for(var i=0; i<myBadMonkey.colliderContactName.length; i++)
						myBadMonkey.removeBody(myBadMonkey.colliderContactName[i]);
						myBadMonkey.colliderContactName.splice(i,1);
						//console.log(myBadMonkey.colliderContactName);
				}
				deleted = false;				
			}
			
			// if(deleted){
				// if(getit){
					// x= mon1.easelObj.x+mon1.easelObj.regX,
					// y= mon1.easelObj.y;
					// defaultworld.addSparkle(x, y, 0, 0);
					// setTimeout(function(){
						// base.removeEntity(spark);
						// base.removeEntity(mon1);
					// }, 1000);
					// mon1.setType("dynamic");
					// mon1.setState({
					// xPixels:x,
					// yPixels:y,
					// angularVelRadians: 2,
					// density: 4,
					// restitution: .9
					// });
				
				// }else{
					// x= man.easelObj.x+man.easelObj.regX,
					// y= man.easelObj.y;
					// defaultworld.addSparkle(x, y, 0, 0);
					// setTimeout(function(){
						// base.removeEntity(spark);
						// base.removeEntity(man);
					// }, 1000);
					// man.setType("dynamic");
					// man.setState({
					// xPixels:x,
					// yPixels:y,
					// angularVelRadians: 2,
					// density: 4,
					// restitution: .9
					// });
				// }
				
				
				
				// $('.score').html(1000);	
				// deleted = false;
			// }
			
			
			
		};	
		
		
		
		return badMonkey;
	})();
}).call(this);

	
	
	$(document).ready(function() {
      canvas = document.getElementById('easelCanvas');
	  debugCanvas = document.getElementById('debugCanvas');
      
      new badMonkey(canvas, debugCanvas);
    });

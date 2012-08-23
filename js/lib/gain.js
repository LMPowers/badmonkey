	(function() {
		window.badMonkey = (function(){
			var framerate = 20,
				gravityX= 0,
				gravityY = 10,
				ppm = 30;
			var camLook = false;
			
			
			
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
			var balljumped_high = null;
			var balljumped_low = null;
			var eagle;
			var ourFruit;		
					
			/* 	GLOBALS	 */		
			var base;
			var gamebg;
			var mike;
			var fruitProjectile;
			var objMap={}; 
			var gameWorld={}; 
			var totalBadass = 0;
			var totalFruit = 0;
			var badassKill = 0;
			var dollyx = 0;
			var groundWidth = 1400;	
			
			var gameStart = false;
			var rolling = false;
			var rollingTarget;
			var rollingSpeed;
			
			var currenLevel = 1;
			
			var gamewin = false;
			var lastRx = 100;
			var firstTime = true;
			
			// var mushroom = {
				// redmush : {
					// type: 'static',
					// radiusPixels: 20,
					// imgSrc: 'img/mush_red.png',
					// frames: {width:55,height:48,count:2,regX:0,regY:0},
					// animations: {
						// jump: [0, 1, false, 2],
						// idle: [1, 1]					
					// },
					// xPixels: 270,
					// yPixels: 555,
					// widthPixels: 55,
					// heightPixels: 48,
					// userData:'mushroom_red'
				// },
				// bluemush : {
					// type: 'static',
					// radiusPixels: 20,
					// imgSrc: 'img/mush_blue.png',
					// frames: {width:55,height:48,count:2,regX:0,regY:0},
					// animations: {
						// jump: [0, 1, false, 2],
						// idle: [1, 1]					
					// },
					// xPixels: 450,
					// yPixels: 555,
					// widthPixels: 55,
					// heightPixels: 48,
					// userData:'mushroom_blue'
				// }
				
			// };
					
			
			

			var camFollow = false;
			var camTarget={};		
			var backtopav = false;
		
			var cvs; // our canvas
			
			var imglists={
				startbg : 'img/title.jpg',
				startbtn: 'img/play.png',
				replaybtn: 'img/replay.png',
				homebtn: 'img/home.png',
				pausebtn: 'img/pause.png',
				stargfx: 'img/star.png',
				nextbtn: 'img/next.png',
				levelbtn: 'img/levelbtn.png',
				statustxt: 'img/status.png',
				gamebg: 'img/bg.jpg',
				ground: 'img/ground.png',
				mike: 'img/man.png',
				apple: 'img/ball.png',				
				projectile: 'img/projectile.png',
				lgtree: 'img/b_tree.png',
				monkey1: 'img/monkeys.png',
				explode_leaf: 'img/leaf.png',
				explode_red: 'img/sparkle_red_21x23.png',
				explode_yellow: 'img/sparkle_y_21x23.png',
				appleui: 'img/uiapple.png',
				popup: 'img/popup.png'				
				
			};
			
			
			function badMonkey(canvas, debugCanvas){
				base = this; 
									
				/* 
				-> load Preloader 
				-> load GUI
				-> if Play load LevelSelection
				-> loadGameLevel 
				*/
				
				loadPreloader();	
				base.world = new EaselBoxWorld(this, framerate, canvas, debugCanvas, gravityX, gravityY, ppm);				
				
			};

			
			
			function loadPreloader(){
				var loader = new PxLoader();				
				for(key in imglists){
					var pxImg = new PxLoaderImage(imglists[key]);
					pxImg.imageNumber = key+1;
					loader.add(pxImg);
				}
				
				loader.addProgressListener(function(e){
					$('.loader').text(Math.floor((e.completedCount/e.totalCount)*100)+' %');
				});
				
				loader.addCompletionListener(function(){
					//loadGUI();	
					loadGameLevel.level_1();					
					
				});
				
				loader.start();
				
			}
			
			
			
			function loadGUI(){					
				dollyx=0; 				
				restart();				
				// var ctx = canvas.getContext('2d');
				// ctx.clearRect(0,0,canvas.width, canvas.height);
				base.world.easelStage.x = 0;						
				
				base.world.addImage(imglists.startbg);
				var startbtn = new spriteLoader(spriteLists.startbtn, base.world.easelStage);
				startbtn.animation.x = 400;
				startbtn.animation.y = 400;	
				startbtn.animation.gotoAndPlay('normal');
				
				startbtn.animation.onPress = function(e){
					startbtn.animation.gotoAndPlay('hit');
					e.onMouseUp = function(event){
						startbtn.animation.gotoAndPlay('normal');
						LevelSelection();
						base.world.easelStage.removeChild(startbtn.animation);
					}
				}				
				base.world.easelStage.update();	
			}
			
			
			function LevelSelection(){				
				var x = 200;
				var y = 400;
				var count = 0;
				
				for(var i=0; i<2; i++){
					for(var j=0; j<5; j++){
						count ++;
						var lvlselection = new spriteLoader(spriteLists.levelbtn, base.world.easelStage);			
						lvlselection.animation.x = x+100*j;
						lvlselection.animation.y = y+100*i;	
						if(j==0 && i==0)
							lvlselection.animation.gotoAndPlay('nostar');
						else if(j==1 && i==0)
							lvlselection.animation.gotoAndPlay('onestar');
						else if(j==2 && i==0)
							lvlselection.animation.gotoAndPlay('twostar');
						else
							lvlselection.animation.gotoAndPlay('lock');
						
						lvlselection.animation.tagname = count;
						
						lvlselection.animation.onPress= function(e){
							switch(this.tagname){
								case 1:												
									loadGameLevel.level_1();
									break;
								default:
									break;							
							}
							
						};						
					}					
				}
								
			}
			
			
			var loadGameLevel = {
				level_1 : function(){
					// restart all game logic
					restart();							
					base.world = new EaselBoxWorld(this, framerate, canvas, debugCanvas, gravityX, gravityY, ppm);	

					dollyx=-500;
					
					gamebg = base.world.addImage(imglists.gamebg);
					base.world.addImage(imglists.lgtree, {x:750, y:205});
					base.world.addImage(imglists.ground, {x:0, y:470});
					
					mike = new littleBoys(ourChar.mike, base.world.easelStage, 170, 450);								
					mike.animation.gotoAndPlay("normal");
					
					
					var items = [
						{ userData: 'ground1', type:'static', imgSrc: 'img/asd.png', widthPixels: 3200, heightPixels: 2, xPixels:0, yPixels: 600-100 },
						{ userData: 'ground2', type:'static', widthPixels: 2, heightPixels: 1200, xPixels:1600+800, yPixels: 0 },
						{ userData: 'ground3', type:'static', widthPixels: 2, heightPixels: 1200, xPixels:0, yPixels: 0 },
						{ userData: 'Ball', type: 'static', imgSrc: imglists.apple, radiusPixels: 10, xPixels: 125, yPixels: 600-150, angleRadians: 45, angularVelRadians: 2, density: 4, restitution: .5, strength: 90 },
						{ userData: 'grab_0', type: 'static', imgSrc: imglists.monkey1, widthPixels: 46, heightPixels: 50, xPixels: 920, yPixels: 400, strength: 25 },
						{ userData: 'grab_1', type: 'static', imgSrc: imglists.monkey1, widthPixels: 46, heightPixels: 50, xPixels: 820, yPixels: 370, strength: 20 }
					];					
					
					
					for (var i = 0; i < items.length; i++) {						
						gameWorld[items[i].userData] = new monkeyType(items[i]);
					}
					
					myBadMonkey.addToWorld(items);
					
					totalBadass = 2;
					
					// fruits					
					var ourFruit = new fruits();
					ourFruit.fruitsTotal = 4;					
					ourFruit.init('Ball');	
					totalFruit = ourFruit.fruitsTotal;					
					
					// projectile
					fruitProjectile = new animSprite(projTile, base.world.easelStage, 125, 450);
					
				
					showInGameUI(true, imglists.appleui, ourFruit.fruitsTotal);
					
					gameStart = true;
					
					gamebg.onPress = function(event){	
						var currentX = event.stageX;
						var target = base.world.bodiesMap["Ball"];
						var forceX = 40;
						var forceY = -13;
						target.setType("dynamic");
						target.body.ApplyImpulse(base.world.vector(forceX, forceY), base.world.vector(target.body.GetPosition().x, target.body.GetPosition().y));						
						event.onMouseMove = function(e){			
							stagePanning(e.stageX, currentX);					
						};
					};
					
					var activeRoll = setTimeout(function(){
						rolling=true; 
						rollingTarget = 0;
						rollingSpeed = 7;
						clearTimeout(activeRoll);
					}, 1000);
					
					
					// gameResults();
					
					
					base.world.addContactListener({
						BeginContact: function(idA, idB) {	
						 	
						}, 
						
						PostSolve: function(idA, idB, impulse) {
							if (impulse < 0.1) return;
							
							var entityA = gameWorld[idA];
							var entityB = gameWorld[idB];
							if(entityA != undefined || entityB != undefined){
								entityA.hit(impulse, entityB);
								entityB.hit(impulse, entityA);
							}
							
						}
					});
											
				}
			};
			
			
		
			function restart(){
							
				gameWorld={};	// clear gameWorld 
				totalBadass = 0;
				totalFruit = 0;
				badassKill = 0;
				
				base.world.easelStage.removeAllChildren();
				base.world.easelStage.clear();
				
			}
			
			
			
			var animSprite = function(data, stage, x, y){				
				this.isInIdleMode = true;
				this.animation = new BitmapAnimation(new SpriteSheet(data));				
				this.animation.x = x;
				this.animation.y = y;
				stage.addChild(this.animation);				
			};
			
			
			var littleBoys = function(data, stage, x, y){
				animSprite.call(this, data, stage, x, y);
				this.isInIdleMode = true;
			};
			
			function monkeyType(obj){				
				this.userData = obj.userData;
				this.isHit = false;
				this.strength = obj.strength;
				this.dead = false;			
			}
			
			monkeyType.prototype.hit= function(impulse, src){
				this.isHit = true;
				
				if(this.strength){
					this.strength -= impulse;
					// var data = this.userData.replace(/[0-9]/g, '');
					$('.score span').html(parseInt($('.score span').html())+14);
					
					if(this.strength <= 0){
						this.dead = true;
						if(this.userData == "grab_0" || this.userData == "grab_1" ){						
							var obj = base.world.bodiesMap[this.userData];
							$('.score span').html(parseInt($('.score span').html())+1450);
							addSparkles(Math.random()*200+100|0, obj.easelObj.x, obj.easelObj.y, 2);
							badassKill++;
						}
					}
				}
			
			};
			
			function showInGameUI(p, src, total){
				src = src || false;
				total = total || false;				
			
				if(p){
					if(!$('.pause').length){
						$('.container').append('<div class="pause"></div>\
												<div class="score gameui">SCORE <span>0</span></div>\
												<div class="highscore gameui">HIGH<span>0</span></div>\
												<div class="fruitcount gameui"><img src="'+src+'"> X <span>'+total+'</span></div>');
					}
					
					$('.pause, .score, .highscore, .fruitcount').show();
					if($('.pause').length){
						$('.pause').toggle(function(){
							$(this).addClass('clicked');							
							base.world.Ticks.setPaused(true);
						}, function(){
							$(this).removeClass('clicked');							
							base.world.Ticks.setPaused(false);
						});	
					}					
				}else{
					$('.pause, .score, .highscore, .fruitcount').remove();	
				}			
			}		
			
			// fruits all kinds of 
			var fruits = function() {
				this.arrow = null;			
				
				this.fruitsTotal = 0;
				
				this.fruitsOnAir = false,	// is fruits on air or ground
				
				this.fruitsRelease = false,
				
				this.init = function(id){
					var body = base.world.bodiesMap[id];
					this.addEvent(body);
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
				
				
				
				var a = setTimeout(function(){
				
					$.ajax({
						type: "GET",
						url: "process.php",
						data: "type=get&lastRx="+lastRx,
						success: function(response) {
							try{
								if(firstTime){
									var obj= $.parseJSON(response);
									var l = obj[0];
									lastRx = l;									
									firstTime = false;
								}else{
									var obj= $.parseJSON(response);
									var l = obj[0];
									var fX = obj[1];
									var fY = obj[2];
									lastRx = l;
									HitTheBall(target, fX, fY, that);
								}
							}catch(e){
								console.log(response);
							}
						}
					});	
				
					setTimeout(arguments.callee, 5000);
					
				}, 5000);
				
				
				// target.easelObj.onPress = function(e){
					// e.onMouseUp = function(event){
					
						// HitTheBall(target, 50, -17, that);
						
					// };
				// }
			}  
			
			fruits.prototype.hitPoint = function(tX, tY) {
				return this.hitRadius(tX, tY, 0);
			};
			
			fruits.prototype.hitRadius = function(tX, tY, tHit) {
				//early returns speed it up
				if(tX - tHit > this.x + this.hit) { return; }
				if(tX + tHit < this.x - this.hit) { return; }
				if(tY - tHit > this.y + this.hit) { return; }
				if(tY + tHit < this.y - this.hit) { return; }
				
				//now do the circle distance test
				return this.hit + tHit > Math.sqrt(Math.pow(Math.abs(this.x - tX), 2) + Math.pow(Math.abs(this.y - tY), 2));
			};
			
			var HitTheBall= function(target, forceX, forceY, that){
				target.setType("dynamic");
				
				target.body.ApplyImpulse(base.world.vector(forceX, forceY), base.world.vector(target.body.GetPosition().x, target.body.GetPosition().y));
				
				that.fruitsOnAir = true; 
				
				if(mike.isInIdleMode){
					mike.animation.gotoAndPlay("throw");						
				}						
				
				fruitProjectile.animation.gotoAndPlay("a");						
				
				that.fruitsTotal--;						
				updateFruitsGUI(that.fruitsTotal);
				
				rolling = true;
				rollingTarget = -500;
				rollingSpeed = 7;					
				
				if(!that.fruitsRelease){
					window.fruity = setTimeout(function (){								
						that.fruitsRelease = true;
						// if fruits available for throw
						// console.log(badassKill, totalBadass);
						if(that.fruitsTotal > 0 && (badassKill < totalBadass)){
							
							var id = Math.floor(Math.random() * 10);
							var items = [{ userData: 'Ball'+id, type: 'static', imgSrc: imglists.apple, radiusPixels: 10, xPixels: 125, yPixels: 600-150, angleRadians: 45, angularVelRadians: 2, density: 4, restitution: .5, strength: 90 }];
							gameWorld['Ball'+id] = new monkeyType(items[0]);
							base.world.addEntity(items[0]);
							
							var ourFruit = new fruits();
							ourFruit.fruitsTotal = that.fruitsTotal;					
							ourFruit.init('Ball'+id);	
							
							mike.animation.gotoAndPlay("normal");
							rollingTarget = 0;
							rollingSpeed = 7;
						}else{
							gameResults();
							clearTimeout(window.fruity);
						}								
					}, 3000);			
				}
				camFollow = true;
				camTarget.target = target;
				camTarget.initPos = target.easelObj.x;
			}
			
			function gameResults(){
				gameStart = false;
				
				var fruitLeft = $('.fruitcount span').html();
				$('.dbug_delete').append("<span>["+getTime()+"]</span> "+$('.score span').html()+"<br/>");
				showInGameUI(false);
				var box = new Shape();
				var overlay = box.graphics;
				
				overlay.beginFill("rgba(255, 255, 255, 0.5)");
				overlay.drawRect(0,0,1600,canvas.height);					
				box.x =500;				
				base.world.easelStage.addChild(box);
				
				if(badassKill >= totalBadass){
					gamewin = true;
					badassKill = 0;
				}else{
					gamewin = false;
					badassKill = 0;
				}
				
				
				var popup = base.world.addImage(imglists.popup, {x: 620, y: (canvas.height- 363)/2});
				
				if(gamewin){
					
					
					var eff = Math.ceil((fruitLeft/totalFruit) * 2);
					
					var status = new spriteLoader(spriteLists.statustext, base.world.easelStage);
					status.animation.x = popup.x + 245 ;
					status.animation.y = popup.y + 70;	
					status.animation.gotoAndPlay('win');
					
					for (var i=0; i<eff; i++) {
						var star = base.world.addImage(imglists.stargfx, {x:popup.x+172+50*i, y: popup.y+154});					
					}
					
					var hmbtn = new spriteLoader(spriteLists.homebtn, base.world.easelStage);
					hmbtn.animation.x = popup.x + 135;
					hmbtn.animation.y = popup.y + 300;	
					hmbtn.animation.gotoAndPlay('normal');
					
					var repbtn = new spriteLoader(spriteLists.replaybtn, base.world.easelStage);
					repbtn.animation.x = popup.x + 245;
					repbtn.animation.y = popup.y + 300;	
					repbtn.animation.gotoAndPlay('normal');
					
					var nextbtn = new spriteLoader(spriteLists.nextbtn, base.world.easelStage);
					nextbtn.animation.x = popup.x + 355;
					nextbtn.animation.y = popup.y + 300;	
					nextbtn.animation.gotoAndPlay('normal');
					
				}else{
					var status = new spriteLoader(spriteLists.statustext, base.world.easelStage);
					status.animation.x = popup.x + 245 ;
					status.animation.y = popup.y + 70;	
					status.animation.gotoAndPlay('fail');	
					
					var hmbtn = new spriteLoader(spriteLists.homebtn, base.world.easelStage);
					hmbtn.animation.x = popup.x + 170;
					hmbtn.animation.y = popup.y + 300;	
					hmbtn.animation.gotoAndPlay('normal');
					
					var repbtn = new spriteLoader(spriteLists.replaybtn, base.world.easelStage);
					repbtn.animation.x = popup.x + 320;
					repbtn.animation.y = popup.y + 300;	
					repbtn.animation.gotoAndPlay('normal');
					
				}
				
				repbtn.animation.onPress = function(e){
					repbtn.animation.gotoAndPlay('hit');
					e.onMouseUp = function(event){
						eval("loadGameLevel.level_"+currenLevel+"()");						
					};			
				};
				
				hmbtn.animation.onPress = function(e){
					hmbtn.animation.gotoAndPlay('hit');
					e.onMouseUp = function(event){
						loadGUI();
					};			
				};
				
				
			}
			
			
			
			
			
			
			
			
			
			function getTime() {
				var dTime = new Date();
				var hours = dTime.getHours();
				var minute = dTime.getMinutes();
				var period = "AM";
				if (hours > 12) {
					period = "PM"
				}else {
					period = "AM";
				}
				hours = ((hours > 12) ? hours - 12 : hours)
				return hours + ":" + minute + " " + period
			}
			
			
			var myBadMonkey = {				
				addToWorld : function(arr){					
					for (var i in arr){
						var obj = arr[i];
						base.world.addEntity(obj);
					}		
				},
				 
				// add single obj -> world 
				appendBody : function(opts){
					var object = base.world.addEntity(opts);					
					objMap[opts.userData] = object;				
				},
				
				follow : function(obj){
					//var travel = obj.target.easelObj.x - obj.initPos;
					var startFrom = 300;
					var travel = startFrom - obj.initPos;				
											
					if(travel > startFrom && travel< 800){					
						base.world.easelStage.x = base.world.easelStage.x - ((travel - base.world.easelStage.x)*0.01);
					}
				},
				
				backfollow : function(){
					if(base.world.easelStage.x <0)
						base.world.easelStage.x = cams + 10;
				
				},
				
				removeBody : function(obj){					
					var data = obj.body.GetUserData();
					str = " "+ data;
					// $('.dbug_delete').append("Deleting : <b>"+str+"</b><br/>");
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
			
			
			

			
			// sprite loader
			var spriteLoader = function(data, stage){
				this.animation = new BitmapAnimation(new SpriteSheet(data));
				stage.addChild(this.animation);								
			}
			
			
			
			var creatmush = function(data, stage){
				this.animation;
				this.spriteData = {};
				this.init = function(){
					this.spriteData = data;
					this.animation = new BitmapAnimation(new SpriteSheet(this.spriteData));				
					stage.addChild(this.animation);								
				};
				this.init();
			};
			
			
			
		
			
			var guiSrc = new Image();
			var curPos=0;
			var curBack=-500;
			var bg;
			var groundWidth;
			var stageImgWidth;
			
			
			function followPoint(target, speed){				
				dollyx -= (dollyx - target) / speed;	//easing
			}
			
			
			// eagle			
			// eagle = new spriteLoader(randSprite.eagle, base.world.easelStage);
			// eagle.animation.x = 170;
			// eagle.animation.y = 170;
			// eagle.animation.vX = 7;
			// eagle.animation.direction = 90;
			// eagle.animation.gotoAndPlay("fly");
			
			
			// jumpy mushroom			
			// var redmushroom_sprite = myBadMonkey.appendBody(mushroom.redmush);
			// objMap['mushroom_red'].easelObj.gotoAndPlay('idle');
			// var bluemushroom_sprite = myBadMonkey.appendBody(mushroom.bluemush);
			// objMap['mushroom_blue'].easelObj.gotoAndPlay('idle');
			
			
			function clearStage(d){
				d.removeAllChildren();
				var obj = base.world.objects;
				// for(k in obj){
					// base.world.removeEntity(obj[k]); 
					// delete obj[k];
				// }
				for(k in objMap){					
					base.world.removeEntity(objMap[k]); 
					delete objMap[k];
				}
			}
			
			function showthis(){
				clearStage(base.world.easelStage);
				startGame();
			}
			
			
			
			function objectSize(object) {		
			  var object_size = 0;
			  for (key in object){
				if (object.hasOwnProperty(key)) {
				  object_size++;
				}
			  }
			  return object_size;
			}
			
			
			
			//	if rolling set rollingTarget and rollingSpeed			
			
			
			
			
			
			var sparkleMap=[];		
			
			var imgfrm = {
				// 0 : 'img/sparkle_21x23.png',
				0 : imglists.explode_leaf,
				1 : imglists.explode_red,
				2 : imglists.explode_yellow
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

			
			var spriteLists = {
				startbtn : {
					images: [imglists.startbtn],
					frames: {width:145,height:52,regX:72.5,regY:26},
					animations: {
						normal: [0, 0],					
						hit: [1, 1]
					}
				},
				
				replaybtn : {
					images: [imglists.replaybtn],
					frames: {width:105,height:70,regX:52.5,regY:35},
					animations: {
						normal: [0, 0],					
						hit: [1, 1]
					}
				},
				
				nextbtn : {
					images: [imglists.nextbtn],
					frames: {width:105,height:70,regX:52.5,regY:35},
					animations: {
						normal: [0, 0],					
						hit: [1, 1]
					}
				},
				
				homebtn : {
					images: [imglists.homebtn],
					frames: {width:105,height:70,regX:52.5,regY:35},
					animations: {
						normal: [0, 0],					
						hit: [1, 1]
					}
				},
				
				pausebtn : {
					images: [imglists.pausebtn],
					frames: {width:105,height:70,regX:52.5,regY:35},
					animations: {
						normal: [0, 0],					
						hit: [1, 1]
					}
				},
				
				statustext : {
					images: [imglists.statustxt],
					frames: {width:200,height:44,regX:100,regY:22},
					animations: {
						win: [0, 0],					
						fail: [1, 1]
					}
				},
			
				eagle : {
					images: ['img/eagle.png'],
					frames: {width:70,height:60,regX:35,regY:30},
					animations: {
						fly: [0, 3, true, 3],					
						hit: [4, 4]
					}
				},
				
				levelbtn : {
					images: [imglists.levelbtn],
					frames: {width:100,height:90,regX:50,regY:45},
					animations: {
						threestar: [0, 0, false],					
						twostar: [1, 1, false],
						onestar: [2, 2, false],
						nostar: [3, 3, false],
						lock: [4, 4, false]						
					}				
				}
			};
			
			var ourChar = {
				mike : {
					images: [imglists.mike],
					frames: {width:100,height:100,regX:50,regY:50},
					animations: {
						throw: [0, 4, false, 2],					
						idle: [4, 4],
						normal: [0, 0]
					}
				}
			};
			
			var projTile = {
				images: [imglists.projectile],
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
			
			function stagePanning(target, currentX){
				// var mouseXper = e.stageX / canvas.width;
				var targetXper = target / canvas.width;
				// var destX = (stageImgWidth - canvas.width)* targetXper;
				var fdestX = (groundWidth - canvas.width)* targetXper;
				var cngX = currentX - target;
				
				
				//curPos = -destX;
				//curBack = -fdestX;					
				if(cngX>1 && dollyx>-500){
					dollyx -= fdestX/50;						
				}if(cngX<1 && dollyx<-10){					
					dollyx += fdestX/50;						
				}
			
			}
			
			function updateFruitsGUI(total){
				$('.fruitcount span').text(total);			
			}
			
			
			
				
			function concatObject(obj) {
			  str='';
			  for(prop in obj)
			  {
				str+=prop + " value :"+ obj[prop]+"<br/>";
			  }
			  str+="----------------------<br/>";
			  return(str);
			}
			
			
			

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
				
				// if(backtopav){
					// cams = base.world.easelStage.x;
					// myBadMonkey.backfollow();
				// }			
				
				// dragging background
				if(gameStart && gamebg!=undefined){
					base.world.easelStage.x = dollyx;
					gamebg.x = -dollyx*0.9;						
				}
				
				var graveyard = [];

				for (var id in gameWorld) {
					var entity = gameWorld[id];
	
					if (entity && gameWorld[id].dead) {
						// box.removeBody(id);
						var body = base.world.bodiesMap[id];
						base.world.removeEntity(body);
						graveyard.push(id);
					} 
				}

				for (var i = 0; i < graveyard.length; i++) {
					delete gameWorld[graveyard[i]];
				}
				
				
				
				
				if(rolling){
					followPoint(rollingTarget, rollingSpeed);
					if(Math.floor(dollyx)>-2)	rolling = false;
				}
				
				
				if(eagle!= undefined){
					if(eagle.animation.x>800){
						eagle.animation.x=0;
					}
					 eagle.animation.x+=eagle.animation.vX;
					
					console.log(ourFruit.hitRadius(eagle.animation.x, eagle.animation.y, 0));
				}
				
				
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
						}
					}
				}
				
				
				if(balljumped_high!=null){								
					objMap['mushroom_blue'].easelObj.gotoAndPlay('jump');
					var a = objMap[balljumped_high].body.GetFixtureList();
					a.SetRestitution(1.5);
					a.SetDensity(.1);
					a.SetFriction(15);				
					balljumped_high = null;
				}if(balljumped_low!=null){				
					
					objMap['mushroom_red'].easelObj.gotoAndPlay('jump');
					var a = objMap[balljumped_low].body.GetFixtureList();
					a.SetRestitution(0.1);
					a.SetDensity(.5);
					a.SetFriction(0);				
					balljumped_low = null;
				}

				if(deleted){		
					if(myBadMonkey.colliderContactName.length){
						for(var i=0; i<myBadMonkey.colliderContactName.length; i++)
							myBadMonkey.removeBody(myBadMonkey.colliderContactName[i]);
							myBadMonkey.colliderContactName.splice(i,1);
							
					}
					deleted = false;				
				}

			};	
			
			
			
			return badMonkey;
		})();
	}).call(this);

		
		
		$(document).ready(function() {
		  canvas = document.getElementById('easelCanvas');
		  debugCanvas = document.getElementById('debugCanvas');
		  var bdMon = new badMonkey(canvas, debugCanvas);
		  setTimeout(function(){console.log(bdMon);}, 5000);
		  
		  var lastRx = 0;
		  
		  $('.but').click(function(){
			$.ajax({
				type: "GET",
				url: "process.php",
				data: "type=get&lastRx="+lastRx,
				success: function(response) {
					try{
						var obj= $.parseJSON(response);
						var l = obj[0];
						var fX = obj[1];
						var fY = obj[2];
						lastRx = l;
						console.log("Throw The Ball");
					}catch(e){
						console.log(response);
					}
				}
			});	

		  });
		  
		  
		  
		});

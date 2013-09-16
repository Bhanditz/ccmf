var ccmf = require('../index.js'),	//Reference the exported ccmf library
	fs = require('fs'),
	cheerio = require('cheerio'),
	request = require('request'),
	http = require('http');

var deletingTexts = [],
	domain = "http://www.wikipedia.org",
	wikiArticlePaths = [],
	articlesCount=0,
	storedArticlesCount = 0;

module.exports.articles = {
		
		setUp: function (callback) {
			//Load Articles URL
			wikiArticlePaths[0] = "/wiki/Harry_Potter_and_the_Order_of_the_Phoenix";
			wikiArticlePaths[1] = "/wiki/Wiki";
			wikiArticlePaths[2] = "/wiki/Web_application";
			wikiArticlePaths[3] = "/wiki/BBC_Worldwide";
			wikiArticlePaths[4] = "/wiki/BBC";
			wikiArticlePaths[5] = "/wiki/United_states";
			wikiArticlePaths[6] = "/wiki/Hadoop";
			wikiArticlePaths[7] = "/wiki/Node.js";
			wikiArticlePaths[8] = "/wiki/Ruby_(programming_language)";
			wikiArticlePaths[9] = "/wiki/Lonely_planet";
			wikiArticlePaths[10] = "/wiki/wiki/Von_Neumann";
			articlesCount = wikiArticlePaths.length;
			callback();
		},
		register:function(test){
			var textMod = ccmf.ccmf.Text.create();
			var dataMod = ccmf.ccmf.Data.create(); 
			
			console.log("Storing Articles Signature Begin.");
			
			for(var article=0;article<wikiArticlePaths.length;article++){
		
				request(domain+wikiArticlePaths[article],function(error, response, body) {
					
					if(error!=null){
						console.log(error);
					}
					else{
						$ = cheerio.load(body);
				    	
				    	var registeringText = $('#mw-content-text').text().replace(/(<([^>]+)>)/ig,"");
				    	
				    	deletingTexts.push(registeringText);
				    	
				    	if(storedArticlesCount<articlesCount-1){
							var registeringTextShingles = textMod.removedStopWordShingles(registeringText,9);
							var registerShinglesFing = textMod.shinglesFingerprintConv(registeringTextShingles);
							
							/* Extract the Signature */
							var signature = [];
							signature[0] = registerShinglesFing; 
							var minHashSignatures = textMod.minHashSignaturesGen(signature);
							
							dataMod.storeLsh(minHashSignatures,
									function(error){
										if(error===null){
										}
										else{
											console.log(error);
										}
									}
									,
									{
									 author:
										{
											first:"Ethan",
											last:"Lim",
											email:"mail@ethanlim.net"
										}
								    }
							);
							
							registeringTextShingles=null;
							registerShinglesFing=null;
							signature=null;
							minHashSignature=null;
				    	}
				    	
						console.log("Stored Articles :" + storedArticlesCount);
						storedArticlesCount++;
						if(storedArticlesCount==articlesCount){
							test.done();
						}
					}
				});
			}
		},
		search:function(test){
			
			var textMod = ccmf.ccmf.Text.create();
			var dataMod = ccmf.ccmf.Data.create();
			
			// Randomly select an article
			var randomNum=Math.floor(Math.random()*(deletingTexts.length+1));
			
			console.log("Search a random article from registered articles : Article No. "+randomNum);

			var searchTextShingles = textMod.removedStopWordShingles(deletingTexts[randomNum],9);
			var searchShinglesFing = textMod.shinglesFingerprintConv(searchTextShingles);
			var signature = [];
			signature[0] = searchShinglesFing;
			
			var minHashSignature = textMod.minHashSignaturesGen(signature); 
			
			dataMod.conductLsh(minHashSignature,function(snapshot){
				if(snapshot.val()!=null){
					console.log("Found Signature in Band :" + snapshot.ref());
				}
			});
			
			console.log("Search a non-registered article");
			
			var nonRegisteredTextShingles = textMod.removedStopWordShingles(deletingTexts[articlesCount-1],9);
			var nonRegisteredShinglesFing = textMod.shinglesFingerprintConv(nonRegisteredTextShingles);
			
			signature = [];
			signature[0] = nonRegisteredShinglesFing;
			
			var nonRegisteredMinHashSignature = textMod.minHashSignaturesGen(signature); 
			
			dataMod.conductLsh(nonRegisteredMinHashSignature,function(snapshot){
				if(snapshot.val()!=null){
					console.log("Found Signature in Band :" + snapshot.ref());
				}else{
					console.log("Not Found");
				}
			});
			
			test.done();
		},
		deletion:function(test){

			/* Remove all the minhash signatures that was registered */ 
			
			console.log("Deleting testing registered articles from storage");
			
			var storedArticles = deletingTexts.length;
			
			for(var articles=0;articles<storedArticles;articles++){
				
				var textMod = ccmf.ccmf.Text.create();
				var dataMod = ccmf.ccmf.Data.create(); 
				var registeringTextShingles = textMod.removedStopWordShingles(deletingTexts.pop(),9);
				var registerShinglesFing = textMod.shinglesFingerprintConv(registeringTextShingles);
				
				var signature = [];
				signature[0] = registerShinglesFing; 
				var minHashSignature = textMod.minHashSignaturesGen(signature);
				
				dataMod.deleteLsh(minHashSignature,
						{
						 author:
							{
								first:"Ethan",
								last:"Lim",
								email:"mail@ethanlim.net"
							}
						}
				);
				
				registeringTextShingles=null;
				registerShinglesFing=null;
				signature=null;
				minHashSignature=null;
			}

			test.done();
		},
		tearDown:function(callback){
			
			callback();
		}
};

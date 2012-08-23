<?php	
	$time = date('Hms');
	$type = $_GET['type'];
	
	if($type == "get"){
	
		$lastPost = $_GET['lastRx'];
		
		$xml = simplexml_load_file("cor.xml");		
		$data="";
		
		foreach($xml->children() as $child){
			$data.=$child.",";
		}
		
		$savedTime = explode(',', $data);
		
		
		if($lastPost == $savedTime[0]){
			echo "Not Updated";
		}else{
			echo json_encode($savedTime); 
		}
		
	}else{
		$forceX = $_GET['forceX'];
		$forceY = $_GET['forceY'];
		$myxml = simplexml_load_file('cor.xml');
		$myxml->time = $time;
		$myxml->forceX = $forceX;
		$myxml->forceY = $forceY;
		$myxml->asXML('cor.xml');
		echo "file updated";
		
	
	}	
	
	
	
	
?>
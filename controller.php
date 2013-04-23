<?php
	require_once( "../../../wp-blog-header.php" );
	require_once("CnD.php");
	header("HTTP/1.1 200 OK");

	// Filter input variables down
	$input = array_merge(array(
		"filter_conditions"=> json_encode( array() ),
		"cnd_action"=>NULL
		), $_REQUEST
	);
	
	$filter_condition_array = json_decode( stripslashes($input["filter_conditions"]), TRUE );

	$wp_cnd = new CnD( $filter_condition_array );

	switch( $input["cnd_action"] ){
		case "resource":

			// All joined tables must have a post_id field that makes the relationship to wp_posts.ID
//			$wp_cnd->joinTable(array(
//				"name"=>"wp_shopify",
//				"alias"=>"item",
//				"fields"=>array(
//					array("name"=>"type","alias"=>"item_type"),
//					array("name"=>"sku","alias"=>"item_sku"),
//					array("name"=>"price","alias"=>"item_price"),
//					array("name"=>"detail","alias"=>"item_detail")
//				)
//			));
/*
			$wp_cnd->addFilter("category","taxonomy_hierarchy", array(
				"display_name"=>"Filter By Category",
				"type"=>"single_menu",
				"filter_panel"=>1,
				"filter_effect"=>"disable",
				"filter_select_limit"=>1,
				//"sort"=>array("term-menu-order","ASC")
			));
*/
			$wp_cnd->addFilter("color","taxonomy", array(
				"display_name"=>"Filter By Color",
				"type"=>"single_menu",
				"filter_panel"=>1,
				"filter_effect"=>"disable",
				"filter_select_limit"=>1,
				//"sort"=>array("term-menu-order","ASC")
			));

			$wp_cnd->addFilter("season","taxonomy", array(
				"display_name"=>"Filter By Season",
				"type"=>"single_menu",
				"filter_panel"=>1,
				"filter_effect"=>"disable",
				"filter_select_limit"=>1,
				//"sort"=>array("term-menu-order","ASC")
			));

			$wp_cnd->addFilter("variety","taxonomy", array(
				"display_name"=>"Filter By Variety",
				"type"=>"single_menu",
				"filter_panel"=>1,
				"filter_effect"=>"disable",
				"filter_select_limit"=>1,
				//"sort"=>array("term-menu-order","ASC")
			));

			$wp_cnd->addFilter("mum-type","taxonomy", array(
				"display_name"=>"Filter By Type",
				"type"=>"single_menu",
				"filter_panel"=>1,
				"filter_effect"=>"disable",
				"filter_select_limit"=>1,
				//"sort"=>array("term-menu-order","ASC")
			));

			$wp_cnd->addFilter("flower_type","postmeta", array(
				"display_name"=>"Filter By Flower Type",
				"type"=>"single_menu",
				"filter_panel"=>1,
				"filter_effect"=>"disable",
				"filter_select_limit"=>1
				//"sort"=>array("term-menu-order","ASC")
			));

//			$wp_cnd->addFilter("type","custom", array(
//				"display_name"=>"Filter By Type",
//				"type"=>"single_menu",
//				"filter_panel"=>1,
//				"filter_effect"=>"disable",
//				"filter_select_limit"=>1,
//				"panel"=>array(
//					array("name"=>"Video (free)", "exclude_type"=>"postmeta", "meta_key"=>"video_downloadable", "meta_value"=>"1"),
//					array("name"=>"Audio (free)", "exclude_type"=>"postmeta", "meta_key"=>"audio_downloadable", "meta_value"=>"1"), // meta_value allows for the value to be different from the type id.
//					array("name"=>"DVD", "exclude_type"=>"custom_table", "table_name"=>"wp_shopify", "field"=>"type","value"=>"DVD"), // Value is the SQL
//					array("name"=>"CD", "exclude_type"=>"custom_table", "table_name"=>"wp_shopify", "field"=>"type","value"=>"CD"), // Value is the SQL
//					array("name"=>"Book", "exclude_type"=>"custom_table", "table_name"=>"wp_shopify", "field"=>"type","value"=>"Book"), // Value is the SQL
//					array("name"=>"Study Guide", "exclude_type"=>"custom_table", "table_name"=>"wp_shopify", "field"=>"type","value"=>"Study Guide"), // Value is the SQL
//					array("name"=>"Other", "exclude_type"=>"postmeta", "meta_key"=>"resource_type", "meta_value"=>"Other")
//
//				)
//			));


/*
			$wp_cnd->addFilter("price","custom", array(
				"display_name"=>"Filter By Price",
				"type"=>"single_menu",
				"filter_panel"=>1,
				"filter_effect"=>"disable",
				"filter_select_limit"=>1,
				"panel"=>array(
					array("name"=>"Free", "exclude_type"=>"custom_table", "table_name"=>"wp_shopify", "field"=>"price","custom_field_query"=>"IS NULL", "value"=>0), // Value is the SQL
					array("name"=>"$1-25", "exclude_type"=>"custom_table", "table_name"=>"wp_shopify", "field"=>"price","custom_field_query"=>"BETWEEN", "value"=>"0,25"), // Value is the SQL
					array("name"=>"$25-100", "exclude_type"=>"custom_table", "table_name"=>"wp_shopify", "field"=>"price","custom_field_query"=>"BETWEEN", "value"=>"25.01,100"), // Value is the SQL
					array("name"=>"$100+", "exclude_type"=>"custom_table", "table_name"=>"wp_shopify", "field"=>"price","custom_field_query"=>"GREATER THAN", "value"=>"100"), // Value is the SQL
				)
			));
*/

			$wp_cnd->setPostType( "mums" );
			$wp_cnd->setPostDateAddedFormat( "%m/%d/%Y" );

			$wp_cnd->addResultFields(array(
				array("type"=>"default_image","field_name"=>"photo","size"=>array("x"=>150,"y"=>84)),
				array("type"=>"postmeta","field_name"=>"vigor"),
				array("type"=>"postmeta","field_name"=>"response_time"),
				array("type"=>"postmeta","field_name"=>"color"),
				array("type"=>"postmeta","field_name"=>"flower_type"),
				array("type"=>"postmeta","field_name"=>"culture_info_post"),
				array("type"=>"taxonomy","field_name"=>"season","alias"=>"season"),
				array("type"=>"taxonomy","field_name"=>"color","alias"=>"color"),
				array("type"=>"taxonomy","field_name"=>"mum-type","alias"=>"mum_type")
			));

			if( ! array_key_exists("orderby",$filter_condition_array) ){
				$wp_cnd->setOrderBy("post.post_name","ASC");
			}

		break;

		case "event":
			
			$wp_cnd->addFilter("presenters","taxonomy", array(
				"display_name"=>"Filter By Presenter",
				"type"=>"single_menu",
				"filter_panel"=>1,
				"filter_effect"=>"disable",
				"filter_select_limit"=>1,
				"sort"=>array("term-menu-order","ASC")
			));
			
			
			$wp_cnd->addFilter("event-types","taxonomy", array(
				"display_name"=>"Filter By Type",
				"type"=>"single_menu",
				"filter_panel"=>1,
				"filter_effect"=>"disable",
				"filter_select_limit"=>1
			));

			$wp_cnd->addFilter("location","taxonomy", array(
				"display_name"=>"Filter By Location",
				"type"=>"hierarchy_menu_slider",
				"filter_panel"=>1,
				"filter_effect"=>"disable",
				"filter_select_limit"=>1
			));

		
			$wp_cnd->setPostType( "event" );
			$wp_cnd->setGlobalFilter(array(
				array("type"=>"postmeta","field_name"=>"event-end-date","alias"=>"end_date","custom_field_query"=>">=","value"=>date("Y-m-d"))
			)); // For restricting data and panel init.

			$wp_cnd->addResultFields(array(
				array("type"=>"postmeta","field_name"=>"event-start-date","alias"=>"start_date","format"=>"date","format_rule"=>"F j, Y"),
				array("type"=>"postmeta","field_name"=>"event-end-date","alias"=>"end_date","format"=>"date","format_rule"=>"F j, Y"),
				array("type"=>"postmeta","field_name"=>"event-venue","alias"=>"venue"),
				array("type"=>"postmeta","field_name"=>"event-sponsor","alias"=>"sponsor"),
				array("type"=>"postmeta","field_name"=>"event-contact","alias"=>"contact"),
				array("type"=>"postmeta","field_name"=>"event-phone","alias"=>"phone"),
				array("type"=>"postmeta","field_name"=>"event-website","alias"=>"website"),
				array("type"=>"postmeta","field_name"=>"event-email","alias"=>"email"),
				array("type"=>"postmeta","field_name"=>"map-link","alias"=>"map_link"),
				array("type"=>"taxonomy","field_name"=>"presenters","alias"=>"presenter"),
				array("type"=>"default_image","field_name"=>"photo","size"=>array("x"=>150,"y"=>84))
			));

		break;
	}

	$wp_cnd->run();
	$wp_cnd->returnJsonOutput();
?>
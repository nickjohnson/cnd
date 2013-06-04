<?php
/**
 * Click and Discover - Quickly filter out results by various parameters.
 * Copyright (C) 2008 - 2013 Sabramedia, LLC
 * http://sabramedia.com
 *
 * @author Nick Johnson {@link http://nickjohnson.com}
 */
	class CnD
	{
		public $wpdb;
		public $filter = array();
		public $filter_type = array("postmeta","taxonomy");
		public $filter_input = array();
		public $input_filter_set_array = array(); // developed in addFilter() to determine if input is set.
		public $exclude_query = "";
		public $tables = array();
		public $fields = array();
		public $global_exclude_query = array();
		public $panel = array();
		public $panel_filter = array();
		public $results = array();

		public $post_type = "";
		public $post_date_added_format = "%Y/%m/%d";
		public $post_date_modified_format = "%Y/%m/%d";

		public $panel_postmeta_join = ""; // Set in setGlobalFilter and used in getPanelGroupTaxonomy
		public $panel_postmeta_where = ""; // Set in setGlobalFilter and used in getPanelGroupTaxonomy
		private $_custom_table_panel_filters = array();
		public $term_ids = array();
		public $troubleshoot = array();

		public function __construct( $filter_input = array() )
		{
			$this->wpdb = $GLOBALS["wpdb"];
			$this->filter_input = array_merge(array(
				"page"=>0,
				"limit"=>20,
				"search"=>NULL,
				"orderby"=>NULL
			),$filter_input);
		}

		public function addFilter( $name, $type, $ui )
		{
			$ui = array_merge(array(
				"display_name"=>"Display Name Not Set", // Name used in ui
				"type"=>"single_menu", // single_menu, hierarchy_menu_slider, hierarchy_menu_portal, range_slider (TODO)
				"filter_panel"=>1, // boolean
				"filter_effect"=>"hide", // hide, disable
				"filter_select_limit"=>1, // boolean, true:select one filter, false: select one or more
				"hierarchy_level_limit"=>false, // Number of levels to limit, false means don't limit. This id parse in php not js
				"sort"=>"ASC", // ASC, DESC. MySQL parsed
				"limit_panel_by_id"=>NULL
			), $ui);

			array_push($this->filter, array("name"=>$name, "type"=>$type, "ui"=>$ui) );
			$this->input_filter_set_array[$name] = array_key_exists($name, $this->filter_input) && count($this->filter_input[$name]) > 0 ? TRUE : FALSE;
			$this->panel_filter[$name] = array();

			// Set the panel filter for this custom table
			if( $type == "custom" ){
				foreach( $ui["panel"] as $panel_parameter ){
					switch($panel_parameter["exclude_type"]){
						case "postmeta":
							//
						break;

						case "custom_table":
							$this->_custom_table_panel_filters[$panel_parameter["table_name"]]["values"][] = $panel_parameter["value"];
							$this->_custom_table_panel_filters[$panel_parameter["table_name"]]["field"] = $panel_parameter["field"];
							$this->_custom_table_panel_filters[$panel_parameter["table_name"]]["filter_name"] = $name;
						break;
					}


				}

			}
		}

		/**
		 * Sets filters on the outside content query and limits the panel fields by post or postmeta relationships on init.
		 * @param $array
		 *
		 */
		public function setGlobalFilter( $array )
		{
			foreach($array as $filter){
				switch( $filter["type"] )
				{
					case "postmeta":
						$this->global_exclude_query[] = " AND ".$filter["alias"]." ".$filter["custom_field_query"]." '".$filter["value"]."' ";
						$this->panel_postmeta_join = " JOIN ".$this->wpdb->postmeta." AS pm ON post_id=r.object_id AND meta_key='".$filter["field_name"]."' ";
						$this->panel_postmeta_where = " AND pm.meta_value ".$filter["custom_field_query"]." '".$filter["value"]."' ";
						// Hand off the panel filters here.
					break;
				}
			}
		}

		/**
		 * Set the init panel arrays here
		 */
		public function init()
		{
			foreach( $this->filter as $filter ){
				switch( $filter["type"] ){
					case "taxonomy":
						$filter["ui"]["array"] = $this->getPanelGroupFromTaxonomyHierarchy( $filter["name"], $filter["ui"]["sort"], $filter["ui"]["limit_panel_by_id"] );
					break;

					case "taxonomy_hierarchy":
						if( ! $filter["ui"]["hierarchy_level_limit"] ){
							$filter["ui"]["array"] = $this->getPanelGroupFromTaxonomyHierarchy( $filter["name"], $filter["ui"]["sort"], $filter["ui"]["limit_panel_by_id"] );
						}else{
							$filter["ui"]["array"] = $this->filterHierarchyLevel($this->getPanelGroupFromTaxonomyHierarchy( $filter["name"], $filter["ui"]["sort"], $filter["ui"]["limit_panel_by_id"] ), $filter["ui"]["hierarchy_level_limit"]);
						}
					break;

					case "postmeta":
						$filter["ui"]["array"] = $this->getPanelGroupFromPostmeta( $filter["name"], $filter["ui"]["sort"] );
					break;

					case "custom":
						foreach( $filter["ui"]["panel"] as $panel_parameter ){
							switch($panel_parameter["exclude_type"]){
								case "postmeta":
									$filter["ui"]["array"][] = array("id"=>$panel_parameter["meta_key"].":".$panel_parameter["meta_value"], "name"=>$panel_parameter["name"]);
								break;

								case "custom_table":
									// Get custom_table data which should be set before this is run.
									$filter["ui"]["array"][] = array("id"=>$panel_parameter["table_name"].":".$panel_parameter["field"].":".$panel_parameter["value"], "name"=>$panel_parameter["name"]);
								break;
							}
						}
					break;
				}

				$this->panel[$filter["name"]] = $filter["ui"];
			}
		}

		public function setPostType( $post_type )
		{
			$this->post_type = " AND p.post_type = '{$post_type}' ";
		}

		public function setPostDateAddedFormat( $format )
		{
			$this->post_date_added_format = $format;
		}

		public function setPostDateModifiedFormat( $format )
		{
			$this->post_date_modfied_format = $format;
		}

		public function isThisTheOnlyGroupFilterSet($this_group)
		{
			$alone = TRUE;
			foreach($this->input_filter_set_array as $group=>$is_set){
				if( $group != $this_group && $is_set ){
					$alone = FALSE;
					break;
				}
			}
			return $alone;
		}

		public function setOrderBy( $field, $direction )
		{
			// We will want to check the field name against the set fields to make sure the name is relevant.
			$this->filter_input["orderby"][] = $field . ($direction ? " " . $direction : "") ; // field_name ASC|DESC
		}

		public function run()
		{
			if( array_key_exists("init", $this->filter_input ) && $this->filter_input["init"] ){
				$this->init();
			}
			$this->setPostExcludeQueries();
			//$this->setCustomPanelFilters();
			//print_r($this->panel_filter);

			// Handle values here
			$postmeta_field_query_array = array();
			$postmeta_subselect_query_array = array();
			$taxonomy_field_query_array = array();
			$taxonomy_subselect_query_array = array();
			$p2p_field_query_array = array();
			$p2p_subselect_query_array = array();
			$post_field_query_array = array();
			$post_subselect_query_array = array();


			foreach( $this->fields as $field){
				$field_name = $field["field_name"];
				$field_display_name = array_key_exists("alias",$field) ? $field["alias"] : $field["field_name"];
				switch( $field["type"] ){
					case "postmeta": // postmeta values
						array_push( $postmeta_field_query_array, "`post`.`".$field_display_name."` AS ".$field_display_name);
						array_push( $postmeta_subselect_query_array, "(SELECT meta_value FROM ".$this->wpdb->postmeta." WHERE post_id=p.ID AND meta_key='".$field_name."' ) AS `".$field_display_name."`");
					break;

					// Ask Jonathan about this area.
					case "default_image":
						$field_name = "photo";
						$field_display_name = "photo";
						array_push( $postmeta_field_query_array, "post.".$field_name." AS ".$field_display_name);
						array_push( $postmeta_subselect_query_array, "(SELECT guid FROM ".$this->wpdb->posts.",".$this->wpdb->postmeta." WHERE ".$this->wpdb->postmeta.".post_id=p.ID AND ".$this->wpdb->postmeta.".meta_key='_thumbnail_id' AND meta_value=".$this->wpdb->posts.".ID AND post_mime_type IN('image/jpeg','image/png') GROUP BY meta_key ) AS ".$field_name." ");
					break;

					case "taxonomy": // taxonomy related posts values
						$taxonomy_field_query_array = array_merge( $taxonomy_field_query_array,
							array(
								"`".$field_name."`.`id` AS `".$field_display_name."_id`",
								"`".$field_name."`.`name` AS `".$field_display_name."_name`",
								"`".$field_name."`.`slug` AS `".$field_display_name."_slug`",
								"`".$field_name."`.`parent` AS `".$field_display_name."_parent`"
							)
						);

						// The options_extension is non-standard and may not last ... we will see.
						$options_extension = "";
						if( array_key_exists("options", $field) && $field["options"] ){
							array_push($taxonomy_field_query_array, $field_name.".options AS ".$field_display_name."_options");
							$options_extension = ",(SELECT option_value FROM ".$this->wpdb->options." WHERE option_name = CONCAT('tax_meta_',t.term_id)) AS options ";
						}

						array_push($taxonomy_subselect_query_array,
							" LEFT JOIN "
							."(SELECT "
								."t.term_id AS id,"
								."t.name AS name,"
								."t.slug AS slug,"
								."r.object_id AS object_id, "
								."x.parent AS parent "
								.$options_extension
							."FROM "
								.$this->wpdb->term_relationships." AS r "
								."JOIN ".$this->wpdb->term_taxonomy." AS x ON x.term_taxonomy_id = r.term_taxonomy_id "
								."JOIN ".$this->wpdb->terms." AS t ON t.term_id = x.term_id "
							."WHERE "
								."x.taxonomy = '".$field_name."' "
							.") AS `".$field_name."` "

						."ON ( `".$field_name."`.`object_id` = post.ID ) ");
					break;

					case "p2p": // Post to post plugin for post to post relationships
						$p2p_field_query_array = array_merge( $p2p_field_query_array,
							array(
								$field_name.".id AS ".$field_display_name."_id",
								$field_name.".post_title AS ".$field_display_name."_name",
								$field_name.".post_name AS ".$field_display_name."_slug",
								$field_name.".post_excerpt AS ".$field_display_name."_excerpt"
							)
						);
						array_push($p2p_subselect_query_array,
							" LEFT JOIN
							(SELECT
								p1.ID AS post_id,
								p2.ID AS id,
								p2.post_title AS post_title,
								p2.post_name AS post_name,
								p2.post_excerpt AS post_excerpt
							FROM
								".$this->wpdb->posts." AS p1
								JOIN ".$this->wpdb->p2p." AS p2p ON p1.ID = p2p.p2p_from
								JOIN ".$this->wpdb->posts." AS p2 ON p2p.p2p_to = p2.ID
							WHERE
								p2.post_type = '".$field_name."'
							) AS ".$field_name."
						ON ( ".$field_name.".post_id = post.ID ) ");
					break;

					case "post_content_to_excerpt":
						array_push($post_field_query_array,"post.post_content AS content" );
						array_push($post_subselect_query_array,"p.post_content AS post_content" );
					break;
				}
			}

			$join_table_string = "";
			$join_table_field_array = array();
			foreach( $this->tables as $table ){

				$join_table_string .= " LEFT JOIN
									".$table["name"]." AS ".$table["alias"]."
								ON ( p.ID = ".$table["alias"].".post_id ) ";

				foreach($table["fields"] as $field ){
					array_push($post_field_query_array, "post.".$field["alias"]." as ".$field["alias"]);
					array_push($join_table_field_array, $table["alias"].".".$field["name"]." as ".$field["alias"]);
				}
			}

			$fields = array_merge(array(
				"post.ID AS id",
				"post.post_title AS name",
				"post.post_name AS slug",
				"post.post_excerpt AS excerpt",
				"post.post_date AS post_date", // Standard field name for sorting
				"post.post_modified AS post_modified", // Standard field name for sorting
				"post.post_date_added AS added",
				"post.post_date_modified AS modified"
			),$postmeta_field_query_array,$taxonomy_field_query_array,$p2p_field_query_array,$post_field_query_array);

			$subquery_fields = array_merge(array(
				"p.ID AS id",
				"p.post_title AS post_title",
				"p.post_name AS post_name",
				"p.post_excerpt AS post_excerpt",
				"p.post_date AS post_date",
				"p.post_modified AS post_modified",
				"DATE_FORMAT(p.post_date, '".$this->post_date_added_format."') AS post_date_added",
				"DATE_FORMAT(p.post_modified, '".$this->post_date_modified_format."') AS post_date_modified"
			),$postmeta_subselect_query_array,$post_subselect_query_array,$join_table_field_array);

			$order_by = $this->filter_input["orderby"] ? " ORDER BY ".implode(",",$this->filter_input["orderby"]) : "";

			$this->query =
				"SELECT
					".implode(",", $fields)."
				FROM
					(SELECT
						".implode(",", $subquery_fields)."
					FROM
						".$this->wpdb->posts." AS p "."
						".$join_table_string."
					WHERE
						p.post_status = 'publish'
					AND
						p.post_password = '' "
					.$this->post_type
					.$this->exclude_query
					.") as post "
				.implode(" ", $taxonomy_subselect_query_array)
				.implode(" ", $p2p_subselect_query_array)."
				WHERE
					post.id > 0 "
				.implode(" ",$this->global_exclude_query)
				.$order_by;

			$posts = $this->wpdb->get_results($this->query, ARRAY_A);
			array_push($this->troubleshoot,$this->query);

			// Parse results here
			// Any intersections after topics will be easier to filter out here.
			// Also the negation and pagination can be done here.
			$results = array();

			foreach( $posts as &$post ){
				foreach( $this->filter as $filter ){
					switch( $filter["type"] ){
						case "postmeta":
							if( $post[$filter["name"]] ){
								$this->panel_filter[$filter["name"]][$post[$filter["name"]]] = 0;
							}
						break;

						case "custom":
							// Loop through custom filter types to determine field names. Remember the postmeta table and custom tables
							// must always have the fields set either in the addResultFields method of via joinTable array for postmeta
							// and custom tables respectively. Otherwise the panel filtering will not work here. I need to see values to
							// compare the appended tables or custom postmeta filtering.
							foreach( $filter["ui"]["panel"] as $panel_parameter ){
								switch( $panel_parameter["exclude_type"] ){
									case "custom_table":
										$table_alias = $this->getCustomTableAlias($panel_parameter["table_name"]);

										if( ! $panel_parameter["custom_field_query"] ){
											if( $post[$table_alias."_".$panel_parameter["field"]] == $panel_parameter["value"] ){
												//$this->panel_filter[$filter["name"]][$panel_parameter["table_name"].":".$panel_parameter["field"].":".$panel_parameter["value"]] = 0;
											}
										}else{
											if( $this->customQueryCondition( $panel_parameter["custom_field_query"], $panel_parameter["value"], $post[$table_alias."_".$panel_parameter["field"]] ) ){
												$this->panel_filter[$filter["name"]][$panel_parameter["table_name"].":".$panel_parameter["field"].":".$panel_parameter["value"]] = 0;
											}
										}
									break;

									case "postmeta":
										// @TODO: Right now the custom postmeta exclude needs the meta_key to be added manually in addResultFields(). This could
										// cause conflict if the alias name in addResultFields is different. Basically breaking the functionality. Maybe force the field name
										// if this is added.... Getting pretty crazy here.
										if( $post[$panel_parameter["meta_key"]] && $post[$panel_parameter["meta_key"]] == $panel_parameter["meta_value"] ){
											$this->panel_filter[$filter["name"]][$panel_parameter["meta_key"].":".$panel_parameter["meta_value"]] = 0;
										}
									break;
								}
							}
						break;
					}

				}

				// Handle data variance and formatting here
				foreach( $this->fields as $field ){
					switch( $field["type"] ){
						case "default_image":
							$size = array_key_exists("size", $field) ? "-".$field["size"]["x"]."x".$field["size"]["y"] : "";
							$extension = pathinfo($post[$field["field_name"]], PATHINFO_EXTENSION );
							$formatted_image = str_replace(".".$extension,$size.".".$extension,$post[$field["field_name"]]);
							if(file_exists(preg_replace("/[http|https].*:\/\/".$_SERVER["HTTP_HOST"]."/",$_SERVER["DOCUMENT_ROOT"],$formatted_image))){
								$post[$field["field_name"]] = $formatted_image;
							}
						break;

						case "post_content_to_excerpt":
							if( empty($post["excerpt"]) ){
								$post_excerpt = $this->tokenTruncate($post["content"], array_key_exists("character_limit",$field) ? $field["character_limit"] : 200 );
								$post["excerpt"] = !empty($post_excerpt) ? $post_excerpt."..." : "";
							}
						break;

						case "taxonomy":
							if( array_key_exists($field["field_name"]."_options",$post) ){
								$post[$field["field_name"]."_options"] = unserialize($post[$field["field_name"]."_options"]);
							}
						break;

						case "postmeta":
							if( array_key_exists("format", $field) ){
								$field_alias = array_key_exists("alias",$field) ? $field["alias"] : $field["field_name"];
								switch( $field["format"] ){
									case "date":
										$post[$field_alias] = date(($field["format_rule"] ? $field["format_rule"] : "Y-m-d" ), strtotime($post[$field_alias]) );
									break;
								}
							}
						break;
					}
				}


				// Duplicate posts may arise due to the potential of multiple taxonomy-related fields.
				// Here the taxonomy details are grouped together.
				// First check for redundant post.
				if( ! array_key_exists($post["id"], $results) ){
					$results[$post["id"]] = $post;
				}else{
					// Multiple taxonomy-related items handled here.
					foreach( $this->fields as $field ){
						if( $field["type"] == "taxonomy" ){
							$field_display_name = array_key_exists("alias",$field) ? $field["alias"] : $field["field_name"];

							if( $results[$post["id"]][$field_display_name."_id"] != $post[$field_display_name."_id"] ){
								if( ! array_key_exists($field_display_name."_array", $results[$post["id"]]) ){
									$results[$post["id"]][$field_display_name."_array"] = array();
								}

								// Move altered post taxonomy type data into new array
								if( array_key_exists($field_display_name."_name", $results[$post["id"]]) ){
									$results[$post["id"]][$field_display_name."_array"][$results[$post["id"]][$field_display_name."_id"]] = array(
										"name"=>$results[$post["id"]][$field_display_name."_name"],
										"slug"=>$results[$post["id"]][$field_display_name."_slug"],
										"parent"=>$results[$post["id"]][$field_display_name."_parent"]
									);

									// Only unset this data when there are more then one items in the sub array.
									if( count($results[$post["id"]][$field_display_name."_array"]) > 1 ){
										unset(
											$results[$post["id"]][$field_display_name."_name"],
											$results[$post["id"]][$field_display_name."_slug"],
											$results[$post["id"]][$field_display_name."_parent"]
										);
									}
								}

								$results[$post["id"]][$field_display_name."_array"][$post[$field_display_name."_id"]] = array("name"=>$post[$field_display_name."_name"],"slug"=>$post[$field_display_name."_slug"]);
							}
						}
					}
				}
			}

			//print_r($this->panel_filter);
			//print_r($this->input_filter_set_array);
			foreach($this->input_filter_set_array as $filter_group=>$is_set){
				// If this filter is not the only one set then return it.
				if( ! $this->isThisTheOnlyGroupFilterSet( $filter_group ) ){
					// Set the panel filter ids
					if( count($this->panel_filter[$filter_group]) > 0 ){
						$this->panel_filter[$filter_group] = array_keys($this->panel_filter[$filter_group]);
					}else{
						$this->panel_filter[$filter_group] = "showall";
					}
				}else{
					// Set the panel to showall
					$this->panel_filter[$filter_group] = "showall";
				}
			}

			$this->results = $results;
		}

		public function joinTable( $table_array )
		{
			array_push($this->tables,$table_array);
		}

		public function getCustomTableAlias( $table_name )
		{
			$table_alias = FALSE;

			foreach( $this->tables as $table ){
				if( $table["name"] == $table_name ){
					$table_alias = $table["alias"];
					break;
				}
			}
			return $table_alias;
		}

		public function formatCustomQuery($format_name, $value)
		{
			$string = "";
			switch( strtolower($format_name) ){
				case "is null":
					$string = " IS NULL ";
				break;

				case "between":
					// e.g., 10,20
					$numbers = explode(",",$value);
					$string = " BETWEEN ".$numbers[0]." AND ".$numbers[1]." ";
				break;

				case "greater than":
					$string = " > ".$value." ";
				break;

				case "lesser than":
					$string = " < ".$value." ";
				break;
			}

			return $string;
		}

		public function customQueryCondition($format_name, $custom_query_value, $post_value)
		{
			$return_value = FALSE;
			switch( strtolower($format_name) ){
				case "is null":
					$return_value = empty($post_value);
				break;

				case "between":
					// e.g., 10,20
					//$post["item_price"] >= 1 && $post["item_price"] <= 25
					$numbers = explode(",",$custom_query_value);
					$return_value = $post_value >= $numbers[0] && $post_value <= $numbers[1];
				break;

				case "greater than":
					$return_value = $post_value > $custom_query_value;
				break;

				case "lesser than":
					$return_value = $post_value < $custom_query_value;
				break;
			}

			return $return_value;
		}

		/**
		 * Develop filter/exclude queries
		 */

		public function setPostExcludeQueries()
		{
			foreach( $this->filter as $filter ){
				switch( $filter["type"] ){
					case "taxonomy":
						$this->setPostTaxonomyExcludeQueries( $filter["name"] );
					break;

					case "taxonomy_hierarchy":
						$this->setPostTaxonomyExcludeQueries( $filter["name"] );
					break;

					case "postmeta":
						// Automatically set postmeta fields for the result array here
						//array("type"=>"postmeta","name"=>"ministry_type"),
						if( is_array($this->filter_input[$filter["name"]]) ){
							foreach( $this->filter_input[$filter["name"]] as &$name ){
								$name = urldecode($name);
							}
						}

						$this->setPostMetaExcludeQueries( $filter["name"] );
						// REMOVED the following convenience in favor with keeping field creation consistent in the controller.
						//array_push($this->fields, array("type"=>"postmeta","field_name"=>$filter["name"]));
					break;

					case "custom":

						// Panel filters array
						$custom_table_filter_array = array();

						foreach( $filter["ui"]["panel"] as $panel_parameter ){
							switch($panel_parameter["exclude_type"]){
								case "postmeta":
									if( array_key_exists( $filter["name"], $this->filter_input ) ){
										if($panel_parameter["meta_key"].":".$panel_parameter["meta_value"] == $this->filter_input[$filter["name"]][0] ){
											$key_value = explode(":",$this->filter_input[$filter["name"]][0]);
											$this->exclude_query .= " AND (SELECT meta_value FROM ".$this->wpdb->postmeta." WHERE post_id=p.ID AND meta_key='".$key_value[0]."' ) = '".$key_value[1]."' ";
										}
									}
								break;

								case "custom_table":
									if( array_key_exists( $filter["name"], $this->filter_input ) ){
										if( $panel_parameter["table_name"].":".$panel_parameter["field"].":".$panel_parameter["value"] == $this->filter_input[$filter["name"]][0] ){
											$table_array = array();
											foreach($this->tables as $table){
												if($table["name"] == $panel_parameter["table_name"] ){
													$table_array = $table;
													break;
												}
											}
											// type cast
											$value = is_string($panel_parameter["value"]) ? "'{$panel_parameter["value"]}'" : $panel_parameter["value"];
											// form query
											if(! array_key_exists("custom_field_query", $panel_parameter) ){
												$field_query = " = ".$value;
											}else{
												$field_query = $this->formatCustomQuery( $panel_parameter["custom_field_query"], $panel_parameter["value"] );
											}

											$this->exclude_query .= " AND ".$table_array["alias"].".".$panel_parameter["field"].$field_query;
										}
									}

								break;
							}
						}
					break;
				}
			}
		}

		public function addResultFields( $field_array )
		{
			$this->fields = array_merge( $this->fields, $field_array);
		}

		/**
		 * @param $postmeta_key
		 * @param null $postmeta_value allows for server controller to determine the value, specifically for custom scenarios.
		 */
		public function setPostMetaExcludeQueries( $postmeta_key )
		{
			if( array_key_exists( $postmeta_key, $this->filter_input ) && $this->filter_input[$postmeta_key] ){
				$this->exclude_query .= " AND (SELECT meta_value FROM ".$this->wpdb->postmeta." WHERE post_id=p.ID AND meta_key='".$postmeta_key."' ) IN ('".implode("','",$this->filter_input[$postmeta_key])."') ";
			}
		}

		public function setPostTaxonomyExcludeQueries( $taxonomy )
		{
			// Only set the queries if the filter input has been set
			if( array_key_exists( $taxonomy, $this->filter_input ) && $this->filter_input[$taxonomy] ){
				$children = get_term_children( $this->filter_input[$taxonomy][0], $taxonomy );
				array_push($children, $this->filter_input[$taxonomy][0]); // push parent on with children
				$term_ids = implode(",",$children);

				$this->exclude_query .= " AND p.ID IN (
					SELECT  object_id
					FROM    ".$this->wpdb->term_relationships." AS r
							JOIN ".$this->wpdb->term_taxonomy." AS x ON x.term_taxonomy_id = r.term_taxonomy_id
							JOIN ".$this->wpdb->terms." AS t ON t.term_id = x.term_id
					WHERE   x.taxonomy = '".$taxonomy."'
							AND object_id IN
							   (
								SELECT object_id
								FROM ".$this->wpdb->term_relationships." AS r
								JOIN ".$this->wpdb->term_taxonomy." AS x ON x.term_taxonomy_id = r.term_taxonomy_id
								JOIN ".$this->wpdb->terms." AS t ON t.term_id = x.term_id
								WHERE   x.taxonomy = '".$taxonomy."'
								AND t.term_id IN  (".$term_ids."))) ";


				$this->setPanelFilters( $taxonomy, $term_ids );
			}
		}

		public function setPanelFilters( $taxonomy, $term_ids )
		{
			array_push($this->term_ids, $term_ids);

			foreach( $this->filter as $filter ){
				if( $filter["name"] != $taxonomy ){
					switch( $filter["type"] ){
						case "taxonomy":
							// Show service in this category
							$filter_query = "SELECT  t.term_id AS id
								FROM    ".$this->wpdb->term_relationships." AS r
										JOIN ".$this->wpdb->term_taxonomy." AS x ON x.term_taxonomy_id = r.term_taxonomy_id
										JOIN ".$this->wpdb->terms." AS t ON t.term_id = x.term_id
								WHERE   x.taxonomy = '".$filter["name"]."'
										AND object_id IN
										   (
											SELECT object_id
											FROM ".$this->wpdb->term_relationships." AS r
											JOIN ".$this->wpdb->term_taxonomy." AS x ON x.term_taxonomy_id = r.term_taxonomy_id
											JOIN ".$this->wpdb->terms." AS t ON t.term_id = x.term_id
											".$this->panel_postmeta_join."
											WHERE
												x.taxonomy = '".$taxonomy."'
											AND
												t.term_id IN (".$term_ids.")
											".$this->panel_postmeta_where."
											)
								GROUP BY id";

							$filter_array = $this->wpdb->get_results($filter_query, ARRAY_A);

							foreach( $filter_array as $this_filter ){
								$this->panel_filter[$filter["name"]][$this_filter["id"]] = 0;
							}
						break;

						case "taxonomy_hierarchy":
							// Show location in this this category
							// NOTICE: The term_taxonomy JOIN is very important to understand that it is pulling both parents and children

							$filter_query = "SELECT  t.term_id AS id
								FROM    ".$this->wpdb->term_relationships." AS r
										JOIN ".$this->wpdb->term_taxonomy." AS x ON x.term_taxonomy_id = r.term_taxonomy_id OR x.parent = r.term_taxonomy_id
										JOIN ".$this->wpdb->terms." AS t ON t.term_id = x.term_id
								WHERE   x.taxonomy = '".$filter["name"]."'
										AND object_id IN
										   (
											SELECT object_id
											FROM ".$this->wpdb->term_relationships." AS r
											JOIN ".$this->wpdb->term_taxonomy." AS x ON x.term_taxonomy_id = r.term_taxonomy_id
											JOIN ".$this->wpdb->terms." AS t ON t.term_id = x.term_id
											".$this->panel_postmeta_join."
											WHERE
												x.taxonomy = '".$taxonomy."'
											AND
												t.term_id IN (".$term_ids.")
											".$this->panel_postmeta_where."
											)
								GROUP BY id";

							$filter_array = $this->wpdb->get_results($filter_query, ARRAY_A);

							foreach( $filter_array as $this_filter ){
								$this->panel_filter[$filter["name"]][$this_filter["id"]] = 0;
							}
						break;

						case "custom":
							// Now apply this filter to the custom panels, if there are any.
							/**
							 * In order to accurately filter out the custom table panels, we need to run through all the taxonomies
							 * and check the custom table intersections. This will determine what is showing on the custom panel.
							 */
							foreach( $this->_custom_table_panel_filters as $custom_table => $parameter ){
								//echo $taxonomy;
								$filter_query = "SELECT ".$parameter["field"]." AS id
									FROM ".$custom_table."
									WHERE post_id IN
									(
										SELECT object_id
										FROM ".$this->wpdb->term_relationships." AS r
										JOIN ".$this->wpdb->term_taxonomy." AS x ON x.term_taxonomy_id = r.term_taxonomy_id
										JOIN ".$this->wpdb->terms." AS t ON t.term_id = x.term_id
										".$this->panel_postmeta_join."
										WHERE
											x.taxonomy = '".$taxonomy."'
										AND
											t.term_id IN (".$term_ids.")
									)
								GROUP BY ".$parameter["field"];

								$filter_array = $this->wpdb->get_results($filter_query, ARRAY_A);
								$new_array = array();
								foreach( $filter_array as $this_filter ){
									$new_array[$custom_table.":".$parameter["field"].":".$this_filter["id"]] = 0;
								}

								if( count($this->panel_filter[$parameter["filter_name"]]) > 0 ){
									$this->panel_filter[$parameter["filter_name"]] = array_intersect_key($new_array, $this->panel_filter[$parameter["filter_name"]]);
								}else{
									$this->panel_filter[$parameter["filter_name"]] = $new_array;
								}

								//array_push($this->troubleshoot, $new_array);

							}
						break;

					}
				}
			}
		}

		public function setCustomPanelFilters()
		{
			// Get all the taxonomy ids to determine the intersection with the custom table.
			// This should be called after all filters have been set.
			$term_id_array = array();

			foreach( $this->filter as $filter ){

				switch( $filter["type"] ){
					case "taxonomy":
						$term_id_array = array_merge($term_id_array, array_keys($this->panel_filter[$filter["name"]]));
					break;

					case "taxonomy_hierarchy":
						$term_id_array = array_merge($term_id_array, array_keys($this->panel_filter[$filter["name"]]));
					break;
				}
			}


			// Now apply this filter to the custom panels, if there are any.
			/**
			 * In order to accurately filter out the custom table panels, we need to run through all the taxonomies
			 * and check the custom table intersections. This will determine what is showing on the custom panel.
			 */
			foreach( $this->_custom_table_panel_filters as $custom_table => $parameter ){
				//echo $taxonomy;
				$filter_query = "SELECT ".$parameter["field"]." AS id
					FROM ".$custom_table."
					WHERE post_id IN
					(
						SELECT object_id
						FROM ".$this->wpdb->term_relationships." AS r
						JOIN ".$this->wpdb->term_taxonomy." AS x ON x.term_taxonomy_id = r.term_taxonomy_id
						JOIN ".$this->wpdb->terms." AS t ON t.term_id = x.term_id
						".$this->panel_postmeta_join."
						WHERE
							t.term_id IN (".implode(",", $this->term_ids).")
					)
				GROUP BY ".$parameter["field"];

				$filter_array = $this->wpdb->get_results($filter_query, ARRAY_A);

				foreach( $filter_array as $this_filter ){
					$this->panel_filter[$parameter["filter_name"]][$custom_table.":".$parameter["field"].":".$this_filter["id"]] = 0;
				}
			}
		}

		// Taxonomy Hierarchy processing functions

		private function createHierarchy( $flat_array = array() )
		{
			foreach( $flat_array as &$node ) {
				foreach( $flat_array as &$node_child ) {
					if( $node["id"] == $node_child["parent_id"] ) {
						array_push($node_child["br"], $node["name"]);
						$node["children"][ $node_child["id"] ] = $node_child;
					}
				}
			}

			$top_level_tree = array();
			foreach( $flat_array as &$node ) {
				if( $node["parent_id"] == 0 ) {
					$top_level_tree[$node["id"]] = $node;
				}
			}
			return array_merge($top_level_tree);
		}

		private function getPanelGroupFromPostmeta ( $postmeta_key, $sort = "ASC" )
		{
			$query = "SELECT
						pm.meta_value AS meta_value
					FROM
						".$this->wpdb->posts." AS p
						JOIN ".$this->wpdb->postmeta." AS pm ON post_id=p.ID
					WHERE
						pm.meta_key = '".$postmeta_key."'
					AND
						p.post_status = 'publish'
					GROUP BY
						pm.meta_value
					ORDER BY pm.meta_value ".$sort;

			$pre_format = $this->wpdb->get_results($query, ARRAY_A);

			$array = array();
			foreach( $pre_format as $meta ){
				$array[] = array("id"=>$meta["meta_value"],"name"=>ucwords(str_replace("_"," ",$meta["meta_value"])));
			}
			return $array;
		}

		/**
		 * @param $taxonomy
		 * @param array $wp_posts_conditions
		 * @return array adds more conditionals on the posts table (key=>value) format e.g., post_type = 'resource'
		 */

		private function getPanelGroupFromTaxonomyHierarchy( $taxonomy, $sort="ASC", $limit_panel_by_id )
		{
			if( is_string($sort) ){
				$sort =  "name ".$sort;
			}else{
				// array handling here
				switch( $sort[0] ){
					case "term-menu-order":
						$sort =  "t.menu_order ".$sort[1];
					break;

					default:
						$sort =  "name ".$sort;
					break;
				}
			}
			// Displays taxonomy that has related published posts.
			$query = "SELECT
						t.term_id AS term_id,
						t.name AS name,
						t.slug AS slug,
						t.term_group AS term_group,
						x.term_taxonomy_id AS term_taxonomy_id,
						x.taxonomy AS taxonomy,
						x.description AS description,
						x.parent AS parent,
						x.count AS count
					FROM
						".$this->wpdb->term_relationships." AS r
						JOIN ".$this->wpdb->term_taxonomy." AS x ON x.term_taxonomy_id = r.term_taxonomy_id
						JOIN ".$this->wpdb->terms." AS t ON t.term_id = x.term_id
						JOIN ".$this->wpdb->posts." AS p ON r.object_id = p.ID
						".$this->panel_postmeta_join."
					WHERE
						x.taxonomy = '".$taxonomy."'
					AND
						p.post_status = 'publish'
					".$this->post_type."
					".$this->panel_postmeta_where."
					GROUP BY
						t.term_id
					ORDER BY ".$sort;

			$pre_format = $this->wpdb->get_results( $query );
//			print_r($pre_format);
//			$pre_format = get_terms( $taxonomy );
//			print_r($pre_format);

			$array = array();
			//if( get_class($pre_format) !== "WP_Error" ){
				foreach( $pre_format as $node ){
					$set = TRUE;
					if( $limit_panel_by_id && !in_array($node->term_id, $limit_panel_by_id ) ){
						$set = FALSE;
					}

					if( $set ){
						$array[$node->term_id] = array(
							"id"=>$node->term_id,
							"name"=>$node->name,
							"parent_id"=>$node->parent,
							"children"=>array(),
							"br"=>array($node->name)
						);
					}
				}
				return $this->createHierarchy($array);
			//}else{
			//	return $pre_format->errors;
			//}
		}

		private  function filterHierarchyLevel( $hierarchy, $level_limit=0, $level=0 )
		{
			$new_array = array();
			foreach($hierarchy as $key=>$node){

				if( $level_limit > 0 && $level < $level_limit  ){
					$new_array[$key] = $node;
				}

				if( count( $node["children"] ) > 0 ){
					$new_array[$key]["children"] = $this->filterHierarchyLevel( $node["children"], $level_limit, $level+1 );
				}
			}

			return $new_array;
		}

		public function returnJsonOutput()
		{
			echo json_encode(array(
				"panel"=>$this->panel,
				"panelFilter"=>$this->panel_filter,
				"resultTotal"=>count($this->results),
				"content"=>array_slice($this->results, $this->filter_input["page"] * $this->filter_input["limit"] , $this->filter_input["limit"])
				//,"trouble_shoot"=>$this->troubleshoot
			));
		}

		public function tokenTruncate($string, $your_desired_width) {
			$string = strip_tags($string);
			$parts = preg_split('/([\s\n\r]+)/', $string, null, PREG_SPLIT_DELIM_CAPTURE);
			$parts_count = count($parts);

			$length = 0;
			$last_part = 0;
			for (; $last_part < $parts_count; ++$last_part) {
			$length += strlen($parts[$last_part]);
			if ($length > $your_desired_width) { break; }
			}

			return implode(" ",array_slice($parts, 0, $last_part));
		}
	}
?>
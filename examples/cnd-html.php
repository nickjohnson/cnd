<?php /* Template Name: Products */ ?>

<?php get_header(); ?>

	<div id="content">

<!--
		<ul class="results-sorting">
			<span class="sort-by">Sort by:</span>
			<li><a class="sort-price">Price</a></li>
			<li class="ui-state-active"><a class="sort-date">Date</a></li>
			<li><a class="sort-title">Title</a></li>
		</ul>
-->
		<div class="cnd-sidebar">
			<div id="cnd-wrap">
				<div id="cnd-navigation">
				</div>
			</div>
		</div>

		<div class="results-list main">
			<div>
				<div>
					<ul class="results-sorting">
						<span class="sort-by">Sort by:</span>
						<li><a class="sort-price">Price</a></li>
						<li class="ui-state-active"><a class="sort-date">Date</a></li>
						<li><a class="sort-title">Title</a></li>
					</ul>
					<div class="cnd-pagination">
						<span class="results"><span class="current-page"></span> of <span class="total-page"></span> <!--(<span class="total-item"></span> Resources)--></span>
						<span class="pagination-limit" style="display:none;"></span>
						<span class="arrows">
							<button class="previous">&lt; Previous </button>
							<button class="next">Next &gt;</button>
						</span>
					</div>
				</div>
			</div>
			<div class="all">
				<ul class="items resources">
				<!-- Template: Event
					<li class="event">
						<div class="event-image">
							<div class="image-wrap">
								<a href=""><img src="<?php bloginfo('template_directory'); ?>/images/default-resource.jpg"/></a>
							</div>
						</div>
						<ul class="event-info">
							<li class="title"><a href="" class="info_title"></a></li>
							<li class="description"><p class="excerpt"></p></li>
							<li class="info-presenter"><span class="presenter"></span></li>
							<li class="info-detail"><span class="item_detail"></span></li>
							<li class="info-price"><span class="item_price"></span></li>
							<?php if (current_user_can('edit_posts')) { ?>
								<li><a href="" class="admin-link">Edit</a></li>
							<?php } ?>
						</ul>
					</li>
				-->
				</ul>
			</div>

			<div class="waiting-for-results"><img src="<?php bloginfo('template_directory'); ?>/images/spinner-small.gif" /></div>
			<div class="no-results" style="display:none;">There are no resources that match your selection.</div>

			<div class="cnd-pagination">
				<span class="results"><span class="current-page"></span> of <span class="total-page"></span> <!--(<span class="total-item"></span> Resources)--></span>
				<span class="pagination-limit" style="display:none;"></span>
				<span class="arrows">
					<button class="previous">&lt; Previous </button>
					<button class="next">Next &gt;</button>
				</span>
			</div>

		</div>

	</div><!-- END #CONTENT -->

<?php get_footer(); ?>
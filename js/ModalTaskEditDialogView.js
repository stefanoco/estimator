"use strict";

var ModalTaskEditDialogView = ModalDialogView.extend({

	// Can't define events here. Add them in initialization.


	initialize: function (options) {

		// On first run, set the template.
		// Can't be done outside this initializer, since
		// it must be run after document.ready, but before the app starts. 
		ModalTaskEditDialogView.prototype.$template = $($.parseHTML(
			$('script.js-edit-task-dialog[type=template]').text()
		));

		// Replace the initializer with the normal code.
		ModalTaskEditDialogView.prototype.initialize = function (options) {

			_.extend(this.events, {
				// Update the other views in realtime.
				'change': 'collectData',
				'keyup':  'collectData',
				'paste':  'collectData',

				'click button.js-delete': 'onClickDelete'
			});

			// TODO: Send $el as option to the superclass constructor instead.
			this.$el = this.$template.clone();
			this.el = this.$el.get(0);

			ModalDialogView.prototype.initialize.apply(this, arguments);

			this.$title = this.$('input.js-title');
			this.$description = this.$('textarea.js-description');
			this.$colorInputs = this.$('input[name="color"]');

			this.$from = this.$('input.js-from');
			this.$to = this.$('input.js-to');
			this.$actual = this.$('input.js-actual');

			this.applyModel();

			$('#modal-overlay').append(this.$el);


			this.boundOnModelDestroy = function() {

				this.model = null;
				this.hide();

			}.bind(this);
			this.model.once('destroy', this.boundOnModelDestroy);
		};

		// Run the initializer manually the first time.
		ModalTaskEditDialogView.prototype.initialize.apply(this, arguments);
	},


	applyModel: function () {

		this.$title.val(this.model.get('title') || String.fromCharCode(160)); // 160: &nbsp;
		this.$description.val(this.model.get('description'));
		this.$colorInputs.filter('[value="' + this.model.get('color') + '"]').prop('checked', true);

		this.$from.val(this.model.get('from'));
		this.$to.val(this.model.get('to'));
		this.$actual.val(this.model.get('actual'));

		// this.$task.attr('data-color', this.model.get('color'));
	},


	hide: function () {

		if (this.model) {

			this.collectData();

			// Clean up.
			this.model.off(null, this.boundOnModelDestroy);
		}

		ModalDialogView.prototype.hide.apply(this, arguments);
	},


	collectData: function (){

		// Save data.
		this.model.set({
			title: this.$title.val(),
			description: this.$description.val(),
			color: this.$colorInputs.filter(':checked').val(),
			from: this.$from.val(),
			to: this.$to.val(),
			actual: this.$actual.val()
		});
	},


	onClickDelete: function () {

		var count = this.model.numTasksRecursive();
		if (count <= 1 || confirm('Really delete ' + count + ' tasks?')) {

			this.model.destroy();
		}
	}
});
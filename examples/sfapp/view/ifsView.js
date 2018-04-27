define(['./sfView'], function (SfView) {
    var IfsView = function () {
        SfView.apply(this, arguments);
    };
    var Parent = function () {};
    Parent.prototype = SfView.prototype;
    IfsView.prototype = new Parent();
    IfsView.prototype.constructor = IfsView;
    IfsView.prototype._super = SfView.prototype;

    IfsView.prototype.render = function (title) {
        if (this.$sfView && this.$sfView.length > 0) {
            return;
        }
        this._super.render.call(this, {}, {
            headTitle: title
        });
        this.$sfBody.html([
            '<div class="sfc-act-sf-mip-box">',
            '<div class="sfc-act-sf-mip-container">',
            '<div class="sfc-act-sf-mip-container-wrapper">'
        ].join(''));
        this.viewer.setConfig({
            target: this.$sfBody.find('.sfc-act-sf-mip-container-wrapper')[0]
        });
        this.resize();
    };
    IfsView.prototype.resize = function () {
        var $ = window.$;
        var view = this;
        var windowHeight = $(window).height();
        view.$sfView.css('min-height', windowHeight + 'px');
        var sfHeadHeight = view.$sfHead.height();
        var pageHeight = windowHeight - sfHeadHeight;
        // view.$sfBody.find('iframe').height(pageHeight);
        view.$sfBody.find('.sfc-act-sf-mip-container-wrapper').height(pageHeight);
        view.viewer.render();
    };
    return IfsView;
});

define(['view', 'action'], function (View, action) {

    var SfView = function () {
        View.apply(this, arguments);
    };
    var Parent = function () {};
    Parent.prototype = View.prototype;
    SfView.prototype = new Parent();
    SfView.uber = View.prototype;
    SfView.prototype.constructor = SfView;

    SfView.prototype.create = function () {
        var me = this;
        me.$superFrame = $('#super-frame');

        if (!me.$superFrame.length) {
            me.$superFrame = $('<div id="super-frame"></div>');
            $('body').append(me.$superFrame);
        }
    };
    SfView.prototype.render = function (data, opts) {
        var me = this;
        if (me.$sfView && me.$sfView.length > 0) {
            return;
        }
        var sfHeadHtml = [
            '<div class="sfa-head">',
                '<div class="sfa-back"><i class="c-icon">&#xe783</i><span>返回</span></div>',
                '<div class="sfa-tool"></div>',
                '<div class="sfa-title">',
                    '<div class="c-line-clamp1">' + opts.headTitle + '</div>',
                '</div>',
            '</div>'
        ].join('');

        // body html
        var sfBodyHtml = [
            '<div class="sfa-body">',
            '<div>'
        ].join('');

        // 初始化 sf dom
        me.$sfView = $('<div class="sfa-view"></div>');
        me.$sfHead = $(sfHeadHtml);
        me.$sfBody = $(sfBodyHtml);

        // 组装 sf dom
        me.$sfView.append(me.$sfHead).append(me.$sfBody);

        me.$superFrame.append(me.$sfView);
    };

    SfView.prototype.attach =  function () {
        var me = this;

        me.$sfView.find('.sfa-back').on('click', function (e) {
            action.back();
            e.preventDefault();
        });
        // 入场动画
    };

    SfView.prototype.detach = function () {
        // 退场动画
    };

    SfView.prototype.destroy = function () {
        var me = this;
        me.$sfView.find('.sfa-back').off('click');
        me.$sfView.remove();
        me.$sfView = null;
        me.$sfHead = null;
        me.$sfBody = null;
    };

    return SfView;
});

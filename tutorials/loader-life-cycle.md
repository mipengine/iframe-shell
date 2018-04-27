### 生命周期总览

create -> （页面被创建）-> created -> attach -> update ->（页面被展现给用户）-> updated -> attached

**中间可能有若干次 update **

detach ->（页面被隐藏）-> detached -> destory ->（页面被回收）-> destoryed

### 各阶段含义

#### create

创建一个 loader。对每个实例而言， 只应在被构造时执行一次。

执行前触发事件 `create`，执行后触发事件 `created`。

开发者若需创建额外的 dom，应当在 `created` 中操作。

#### attach

将一个 mip 页附加到网页上，以展现给用户。此时绑定所有与用户操作相关的事件处理函数。

执行前触发事件 `attach` ，执行后触发事件 `attached`。

开发者若需要绑定自定义的 dom 事件，应该在 `attached` 中操作。

#### update

配置被更新后，重新渲染 mip 页的 iframe。此时按需更新 iframe 的尺寸和 url。

执行前触发事件 `update`，执行后触发事件 `updated`。

开发者若需根据配置的变化做判断逻辑，应当在 `updated` 中操作。

#### detach

将一个 mip 页从网页上移除，使用户不可见。此时解绑所有与用户操作相关的事件处理函数。

执行前触发事件 `detach`，执行后触发事件 `detached`。

开发者若绑定了自定义 dom 事件，应该在 `detach` 中将其解绑。

#### destroy

销毁一个 mip 页实例。销毁后，该实例将不能再被 attach 到网页上，也不能再复用；若已被 attach，则会自动先 detach 再 执行 destory。

执行前触发事件 `destory`，执行后触发事件 `destoryed`。

开发者若创建了额外的 dom，需在 `destory` 事件中将其销毁。
/**
 * Created by marco on 03/08/2016.
 */

$.ajax({
    url: '/getBanner',
    data: publisherId,
    success: success
});

function success(data) {
    console.log(data)
}
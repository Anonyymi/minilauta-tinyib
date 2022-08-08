function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const banners = [
    ['1.jpg', 'x'],
    ['2.png', 'pol'],
    ['3.png', 'e'],
    ['4.gif', 'it'],
    ['5.png', 'pol'],
    ['6.png', 'pol'],
    ['7.png', 'b'],
    ['8.png', 'hikky'],
    ['9.png', 'hikky'],
    ['10.png', 'x'],
    ['11.png', 'x'],
    ['12.jpg', 'mus'],
    ['13.png', 'b'],
    ['14.png', 'a'],
    ['15.png', 'b'],
    ['16.jpg', 'b'],
    ['17.png', 'kuv'],
    ['18.png', 'meta'],
    ['19.png', 'a'],
    ['20.png', 'a'],
    ['21.png', 'b'],
    ['22.png', 'e'],
    ['23.jpg', 'b'],
    ['24.png', 'm'],
    ['25.jpg', 'meta'],
    ['26.png', 'h'],
    ['27.jpg', 'b'],
    ['28.png', 'pol'],
    ['29.gif', 'h'],
    ['30.png', 'jp'],
    ['31.png', 'meta'],
    ['32.jpg', 'b'],
    ['33.jpg', 'h'],
    ['34.png', 'e'],
    ['35.jpg', 'jp'],
    ['36.png', 'e'],
    ['37.png', 'h'],
    ['38.jpg', 'b'],
    ['39.png', 'it'],
    ['40.jpg', 'b'],
    ['41.png', 'a'],
    ['42.png', 'b'],
    ['43.png', 'pol'],
    ['44.png', 'it'],
    ['45.png', 'meta'],
    ['46.png', 'b'],
    ['47.png', 'b'],
    ['48.jpg', 'e'],
    ['49.gif', 'b'],
    ['50.gif', 'b'],
    ['51.jpg', 'b'],
    ['52.jpg', 'kuv'],
    ['53.gif', 'a'],
    ['54.jpg', 'm'],
    ['55.jpg', 'b'],
    ['56.png', 'b'],
];
const banner = banners[randomInt(0, banners.length - 1)];

// register event listeners
window.addEventListener('DOMContentLoaded', function (e) {
    // set banner <a href> and <img>
    document.getElementById('banner_link').href = '/' + banner[1] + '/';
    document.getElementById('banner_img').src = '/banners/' + banner[0];
});

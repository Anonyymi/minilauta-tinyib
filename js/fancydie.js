function setVal(key, val) {
    window.localStorage.setItem(key, val);
}

function getVal(key) {
    return window.localStorage.getItem(key);
}

// detect partially which triggered this error
var triggered_by = 'post';
if (window.location.search.toLowerCase().includes('report=')) {
    triggered_by = 'report';
}

// register event listeners
window.addEventListener('DOMContentLoaded', function (e) {
    // handle post errors
    if (triggered_by === 'post') {
        // restore postform data in-case of error
        if (document.getElementById('fancydie') != null) {
            setVal('postform/restore', 'true');
        }
    }
});

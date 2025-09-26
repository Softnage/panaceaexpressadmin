var myDropzone = new Dropzone("#my-dropzone", { // Make the whole body a dropzone
    url: '/',
    addRemoveLinks: true,
    method: 'put',
    chunking: true,
    forceChunking: true,
    autoQueue: false,
    autoProcessQueue: false
});
myDropzone.autoDiscover = false;

myDropzone.on("addedfile", function(file) {
    var reader = new FileReader();
    if (myDropzone.files.length < 4) {
        reader.onload = function(event) {
            // event.target.result contains base64 encoded image
            console.log("file being uploaded ")
            storage_upload("image", event.target.result, file, myDropzone, (r) => {
                console.log("Storage upload response")
                console.log(r)
            })
        };
        reader.readAsDataURL(file);
    } else {
        console.log('skipping file as we are excceding the upload limit')
    }
});

myDropzone.on("removedfile", function(file) {
    var storageRef = firebase.storage().ref("/");
    storageRef.child(file.fullPath).delete().then(
        function() {
            console.log(file.fullPath + " deleted succefuly")
        }).catch(function(error) {
        console.log("Something is wrong")
        console.log(error)
    });
    });
    
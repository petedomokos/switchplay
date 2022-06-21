
export function emptySettingsGenerator(selection){
    function mySelSettings(selection){
        return selection;
    }

    // api
    mySelSettings.width = function (value) {
        if (!arguments.length) { return width; }
        return mySelSettings;
    };
    mySelSettings.height = function (value) {
        if (!arguments.length) { return height; }
        return mySelSettings;
    };
    mySelSettings.funcType = "empty"
    return mySelSettings;
}

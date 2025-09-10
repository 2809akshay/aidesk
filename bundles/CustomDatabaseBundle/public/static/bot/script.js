document.addEventListener("DOMContentLoaded", () => {
    const orbContainer = document.getElementById("ai-orb-container");
    if (!orbContainer) return; // safety check

    let isDragging = false, offsetX, offsetY;

    orbContainer.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - orbContainer.offsetLeft;
        offsetY = e.clientY - orbContainer.offsetTop;
        orbContainer.style.cursor = "grabbing";
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        orbContainer.style.cursor = "grab";
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            orbContainer.style.left = e.clientX - offsetX + "px";
            orbContainer.style.top = e.clientY - offsetY + "px";
        }
    });

    // Toggle fullscreen on double-click
    orbContainer.addEventListener("dblclick", () => {
        if (!document.fullscreenElement) {
            orbContainer.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });
});

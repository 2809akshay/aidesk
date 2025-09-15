document.addEventListener('DOMContentLoaded', function() {
    const aiOrbContainer = document.getElementById('ai-orb-container');
    const bot = document.getElementById('bot');
    const aiStructure = document.getElementById('ai-structure');
    const closeBtn = document.querySelector('.close-btn');
    const transcriptText = document.getElementById('transcriptText');
    
    let isDragging = false;
    let currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;
    let recognition;
    let isRecording = false;
    let finalTranscript = '';
    
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = function(event) {
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                    // Call API when final transcript is available
                    callAnlashisAPI(finalTranscript);
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            // Show speech in input layer
            transcriptText.value = finalTranscript + interimTranscript;
        };
        
        recognition.onend = function() {
            isRecording = false;
            aiOrbContainer.disabled = false;
            bot.classList.remove('listening');
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            isRecording = false;
            aiOrbContainer.disabled = false;
            bot.classList.remove('listening');
        };
    }
    
    // Auto-start AI structure on page load
    aiStructure.style.display = 'block';

    // Auto-start speech recognition on page load
    startRecording();

    // Function to call anlashis-data API and speak response
    function callAnlashisAPI(transcript) {
        const formData = new FormData();
        formData.append('transcriptText', transcript);

        fetch('/anlashis-data', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                // Update transcriptText input
                transcriptText.value = data.message;

                // Speak the message using TTS
                if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(data.message);

                    // Get available voices
                    const voices = speechSynthesis.getVoices();
                    const indianVoice = voices.find(voice => voice.lang === "en-IN");

                    // Assign Indian English voice if available
                    if (indianVoice) {
                        utterance.voice = indianVoice;
                    } else {
                        console.warn("Indian English voice not found, using default voice.");
                    }

                    // Optional tweaks for natural sound
                    utterance.pitch = 1;
                    utterance.rate = 1;

                    // Speak it
                    speechSynthesis.speak(utterance);
                }
            })
            .catch(error => {
                console.error('Error calling anlashis-data API:', error);
            });
    }
    
    // Close structure
    closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        aiStructure.style.display = 'none';
    });
    
    // Make bot draggable
    aiOrbContainer.addEventListener('mousedown', function(e) {
        e.preventDefault();
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        
        if (e.target === bot || bot.contains(e.target)) {
            isDragging = true;
            aiOrbContainer.classList.add('dragging');
        }
    });

    bot.addEventListener('click', startRecording);
    
    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            aiOrbContainer.classList.remove('dragging');
            initialX = currentX;
            initialY = currentY;
        }
    });
    
    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            e.preventDefault();
            
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            
            xOffset = currentX;
            yOffset = currentY;
            
            setTranslate(currentX, currentY, aiOrbContainer);
        }
    });

    function startRecording(e) {
        // Only start recording on single click, not when dragging
        if (isDragging || !recognition) return;
        
        try {
            if (isRecording) {
                recognition.stop();
                return;
            }
            
            finalTranscript = '';
            recognition.lang = "en-US";
            recognition.start();
            isRecording = true;
            aiOrbContainer.disabled = true;
            bot.classList.add('listening');
        } catch (error) {
            console.error('Recognition start error:', error);
        }
    }
    
    function setTranslate(xPos, yPos, el) {
        el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
    }
    
    // Touch support for mobile devices
    aiOrbContainer.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        initialX = touch.clientX - xOffset;
        initialY = touch.clientY - yOffset;
        
        isDragging = true;
        aiOrbContainer.classList.add('dragging');
    });
    
    document.addEventListener('touchend', function() {
        if (isDragging) {
            isDragging = false;
            aiOrbContainer.classList.remove('dragging');
            initialX = currentX;
            initialY = currentY;
        }
    });
    
    document.addEventListener('touchmove', function(e) {
        if (isDragging) {
            e.preventDefault();
            const touch = e.touches[0];
            
            currentX = touch.clientX - initialX;
            currentY = touch.clientY - initialY;
            
            xOffset = currentX;
            yOffset = currentY;
            
            setTranslate(currentX, currentY, aiOrbContainer);
        }
    });
});
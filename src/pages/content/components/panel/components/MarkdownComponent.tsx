import React, { useEffect, useRef } from 'react';
import { marked } from 'marked';
import Clipboard from 'clipboard';
import hljs from 'highlight.js';
import { useQuestionStore } from '../stores/question';
function MarkdownComponent({ markdownText }) {
    const markdownContainerRef = useRef(null);
    useEffect(() => {
        const renderer = new marked.Renderer();
        renderer.code = (code, language) => {
            const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
            const highlighted = hljs.highlight(validLanguage, code).value;
            return `<pre>
         
          <code class="hljs ${language}" data-lan="${language}">${highlighted}</code>
          </pre>`;
        };

        marked.setOptions({ renderer });

        const container = markdownContainerRef.current;
        container.innerHTML = marked(markdownText);
    }, [markdownText]);
    useEffect(() => {
        const container = markdownContainerRef.current;

        // 使用marked解析Markdown文本
        container.innerHTML = marked(markdownText);

        // 找到所有代码块
        const codeBlocks = container.querySelectorAll('pre code');

        // 为每个代码块添加复制按钮
        codeBlocks.forEach((codeBlock) => {
            //   const button = document.createElement('button');
            //   button.className = 'copy-button';
            //   button.textContent = '复制';
            //   codeBlock.parentElement.appendChild(button);
            const buttonDiv = document.createElement('div');
            buttonDiv.className = 'button-container';
            const lanSpan = document.createElement('span')
            lanSpan.className = 'lan-span'
            lanSpan.innerHTML = codeBlock?.classList[1]
            // 创建SVG元素
            const originalSVG = '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>'; // 初始SVG
            const feedbackSVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" t="1691848915425" class="icon" viewBox="0 0 1024 1024" version="1.1" p-id="3971" width="1em" height="1em"><path d="M925.866667 221.866667c-17.066667-17.066667-42.666667-17.066667-59.733334 0L379.733333 729.6c-4.266667 4.266667-12.8 8.533333-17.066666 8.533333-4.266667 0-8.533333 0-17.066667-8.533333l-192-196.266667c-17.066667-17.066667-42.666667-17.066667-59.733333 0-17.066667 17.066667-17.066667 42.666667 0 59.733334l192 196.266666c21.333333 21.333333 46.933333 34.133333 76.8 34.133334s55.466667-12.8 76.8-34.133334L925.866667 281.6c17.066667-17.066667 17.066667-46.933333 0-59.733333z" fill="#221E1F" p-id="3972"/></svg>`
            
            // const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            // svg.setAttribute('stroke', 'currentColor');
            // svg.setAttribute('fill', 'none');
            // svg.setAttribute('stroke-width', '2');
            // svg.setAttribute('viewBox', '0 0 24 24');
            // svg.setAttribute('stroke-linecap', 'round');
            // svg.setAttribute('stroke-linejoin', 'round');
            // svg.setAttribute('class', 'h-4 w-4');
            // svg.setAttribute('height', '1em');
            // svg.setAttribute('width', '1em');

            // // 创建path元素并设置属性
            // const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            // path.setAttribute('d', 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2');
            // svg.appendChild(path); // 将path添加到svg中

            // // 创建rect元素并设置属性
            // const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            // rect.setAttribute('x', '8');
            // rect.setAttribute('y', '2');
            // rect.setAttribute('width', '8');
            // rect.setAttribute('height', '4');
            // rect.setAttribute('rx', '1');
            // rect.setAttribute('ry', '1');
            // svg.appendChild(rect); // 将rect添加到svg中

            // 此时，svg元素已经具有完整的结构，你可以将其添加到DOM中

            const button = document.createElement('button');
            button.className = 'copy-button';

            buttonDiv.appendChild(lanSpan);

            buttonDiv.appendChild(button);
            // 插入按钮的div到code的前面
            codeBlock.parentElement.insertBefore(buttonDiv, codeBlock);
            const buttonText = document.createTextNode('复制');
            const svgContainer = document.createElement('div');
            svgContainer.className = 'svg-container';
            svgContainer.innerHTML = originalSVG;
            button.appendChild(svgContainer);
            button.appendChild(buttonText);
            function giveFeedback() {
                buttonText.nodeValue = '已复制！';
                svgContainer.innerHTML = feedbackSVG
                setTimeout(() => {
                    buttonText.nodeValue = '复制';
                    svgContainer.innerHTML = originalSVG;

                }, 2000);
            }

            // 使用clipboard.js设置复制功能
            const clipboard = new Clipboard(button, {
                text: () => codeBlock.outerText,
            }).on('success', function (e) {
                giveFeedback();
            });

            // 清理
            return () => {
                clipboard.destroy();
            };
        });
    }, [markdownText]);

    return <div ref={markdownContainerRef}
        className={`markdown-container ${useQuestionStore.getState().isComplete ? '' : 'result-streaming'}`} />;
}

export default MarkdownComponent;

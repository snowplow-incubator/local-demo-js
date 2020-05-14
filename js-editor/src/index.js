import jss from "jss";
import preset from "jss-preset-default";
import cn from "classnames";

jss.setup(preset());

const styles = {
  runButton: {
    fontSize: "1rem",
    marginRight: "0.5em",
    border: "none",
    borderRadius: "2px",
    color: "white",
    cursor: "pointer",
    display: "flex",
    padding: 0,
    "& span": {
      padding: ".75em",
      position: "relative",
      backgroundColor: "#6638b8",
      display: "block",
    },
    "& span:before": { content: '"Run example"' },
    "&.viewing span:before": {
      content: '"Back to code"',
    },
  },
  w: {
    position: "relative",
  },
  viewerFrame: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "100%",
    border: "1px solid black",
    display: "none",
    "&.on": {
      display: "block",
    },
  },
  bottomBar: {
    padding: "1rem 0",
    display: "flex",
    alignItems: "center",
  },
  feedback: {
    display: "flex",
    alignItems: "center",
  },
  editorw: {},
  editor: {
    paddingTop: "10px",
    backgroundColor: "#1e1e1e",
    "&.off": {
      visibility: "hidden",
    },
  },
  sendEvent: {
    marginRight: "0.5rem",
  },
  errors: {},
};

const { classes } = jss.createStyleSheet(styles).attach();

const initShortFrame = (id) => `
<script>
(function() {
    var XHR = XMLHttpRequest.prototype;
    // Remember references to original methods
    var open = XHR.open;
    var send = XHR.send;

    // Overwrite native methods
    // Collect data:
    XHR.open = function(method, url) {
        this._method = method;
        this._url = url;
        return open.apply(this, arguments);
    };

    // Implement "ajaxSuccess" functionality
    XHR.send = function(postData) {
        window.parent.postMessage({id:'${id}',error:null,postData:postData})
        this.addEventListener('load', function() {
            this._body = postData;
        });
        return send.apply(this, arguments);
    };
})();
function reportError(e) {
  window.parent.postMessage({id:'${id}',error:e,postData:null})
}
document.write(unescape("%3Cscript src='https://d1fc8wv8zag5ca.cloudfront.net/2.10.2/sp.js' type='text/javascript'%3E%3C/script%3E"));
</script>
`;

const runners = [];
function addRunner(runner) {
  runners.push(runner);
}

function stopRunner([_container, shutdownCb]) {
  shutdownCb();
}

function stopAllRunners() {
  runners.forEach(stopRunner);
}

function createBottomBar(button) {
  const bar = document.createElement("div");
  const feedback = document.createElement("div");
  feedback.className = cn("feedback", classes.feedback);
  bar.className = classes.bottomBar;
  bar.appendChild(button);
  bar.appendChild(feedback);
  return bar;
}

function createRun() {
  const button = document.createElement("button");
  const span = document.createElement("span");
  button.appendChild(span);
  button.className = classes.runButton;
  return button;
}

function createViewer() {
  const frame = document.createElement("iframe");
  frame.className = classes.viewerFrame;
  frame.src = "about:blank";
  frame.sandbox =
    "allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts allow-top-navigation-by-user-activation";
  return frame;
}

function createContainer(bar, viewer) {
  const container = document.createElement("div");
  container.className = cn("snowplow-example-short", classes.container);
  const editor = document.createElement("div");
  editor.className = classes.editor;
  const editorw = document.createElement("div");
  editorw.className = classes.editorw;
  editorw.appendChild(editor);
  const e = document.createElement("div");
  e.className = cn("errors", classes.errors);
  const w = document.createElement("div");
  w.className = classes.w;
  w.appendChild(editorw);
  w.appendChild(viewer);
  container.appendChild(w);
  container.appendChild(e);
  container.appendChild(bar);
  return [container, editor];
}

function createSendEvent() {
  const container = document.createElement("div");
  container.className = classes.sendEvent;
  const text = document.createTextNode("Event sent");
  container.appendChild(text);
  setTimeout(() => {
    container.remove();
  }, 1000);
  return container;
}

function createError(e) {
  const container = document.createElement("div");
  container.className = classes.sendEvent;
  const text = document.createTextNode(e);
  container.appendChild(text);
  return container;
}

window.addEventListener(
  "message",
  (e) => {
    try {
      const c = document.getElementById(`snowplow-example-short-${e.data.id}`);
      if (e.data.error) {
        const f = c.querySelector(".errors");
        f.appendChild(createError(e.data.error));
      } else {
        const f = c.querySelector(".feedback");
        f.appendChild(createSendEvent());
      }
    } catch (e) {}
  },
  false
);

function init() {
  import("monaco-editor").then((monaco) => {
    document.querySelectorAll(".snowplow-example-short").forEach((c, i) => {
      const code = c.querySelector("pre > code");
      const inner = code.innerText;

      const viewer = createViewer();
      const run = createRun();
      const bar = createBottomBar(run);
      const [container, editor] = createContainer(bar, viewer);
      container.id = `snowplow-example-short-${i}`;

      const e = monaco.editor.create(editor, {
        value: inner,
        language: "javascript",
        lineNumbers: "off",
        roundedSelection: false,
        readOnly: false,
        theme: "vs-dark",
        codeLens: false,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: false,
      });

      const cb = () => {
        stopAllRunners();
        const v =
          initShortFrame(i) +
          "<script>try {" +
          e.getValue() +
          "} catch(e) {reportError(e)}</script>";
        var blob = new Blob([v], { type: "text/html" });
        viewer.src = URL.createObjectURL(blob);
        container.querySelector(".errors").innerHTML = "";
      };

      run.addEventListener("click", cb);

      c.replaceWith(container);
      addRunner([container, () => {}]);

      let prevHeight = 0;

      const updateEditorHeight = () => {
        const editorElement = e.getDomNode();

        if (!editorElement) {
          return;
        }

        const lineHeight = e.getOption(monaco.editor.EditorOption.lineHeight);
        const lineCount = e.getModel().getLineCount() || 1;
        const height = e.getTopForLineNumber(lineCount + 1) + lineHeight;

        if (prevHeight !== height) {
          prevHeight = height;
          editorElement.style.height = `${height}px`;
          e.layout();
        }
      };

      // https://github.com/microsoft/monaco-editor/issues/794#issuecomment-583367666
      e.onDidChangeModelDecorations(() => {
        updateEditorHeight(); // typing
        requestAnimationFrame(updateEditorHeight); // folding
      });
      requestAnimationFrame(updateEditorHeight);
    });
  });
  import("monaco-editor").then((monaco) => {
    document.querySelectorAll(".snowplow-example").forEach((c) => {
      const code = c.querySelector("pre > code");
      const inner = code.innerText;

      const viewer = createViewer();
      const run = createRun();
      const bar = createBottomBar(run);
      const [container, editor] = createContainer(bar, viewer);

      let viewing = false;
      const switchOn = () => {
        viewing = true;
      };

      const switchOff = () => {
        viewer.src = "about:blank";
        viewing = false;
      };

      const rerender = () => {
        viewer.className = cn(classes.viewerFrame, { on: viewing });
        editor.className = cn(classes.editor, { off: viewing });
        run.className = cn(classes.runButton, { viewing });
      };

      const e = monaco.editor.create(editor, {
        value: inner,
        language: "html",
        lineNumbers: "off",
        roundedSelection: false,
        readOnly: false,
        theme: "vs-dark",
        codeLens: false,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: false,
      });

      const cb = () => {
        if (viewing) {
          switchOff();
        } else {
          stopAllRunners();
          switchOn();
        }
        rerender();
        var blob = new Blob([e.getValue()], { type: "text/html" });
        viewer.src = URL.createObjectURL(blob);
      };

      run.addEventListener("click", cb);

      c.replaceWith(container);
      addRunner([
        container,
        () => {
          switchOff();
          rerender();
        },
      ]);

      let prevHeight = 0;

      const updateEditorHeight = () => {
        const editorElement = e.getDomNode();

        if (!editorElement) {
          return;
        }

        const lineHeight = e.getOption(monaco.editor.EditorOption.lineHeight);
        const lineCount = e.getModel().getLineCount() || 1;
        const height = e.getTopForLineNumber(lineCount + 1) + lineHeight;

        if (prevHeight !== height) {
          prevHeight = height;
          editorElement.style.height = `${height}px`;
          e.layout();
        }
      };
      // https://github.com/microsoft/monaco-editor/issues/794#issuecomment-583367666
      e.onDidChangeModelDecorations(() => {
        updateEditorHeight(); // typing
        requestAnimationFrame(updateEditorHeight); // folding
      });
      requestAnimationFrame(updateEditorHeight);
    });
  });
}

window.addEventListener("load", init);

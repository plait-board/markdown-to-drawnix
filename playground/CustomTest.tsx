interface CustomTestProps {
  onChange: (definition: string) => void;
}

const CustomTest = ({ onChange }: CustomTestProps) => {
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          onChange(formData.get("mermaid-input")?.toString() || "");
        }}
      >
        <textarea
          id="mermaid-input"
          rows={10}
          cols={50}
          name="mermaid-input"
          onChange={(e) => {
            onChange(e.target.value);
          }}
          style={{ marginTop: "1rem" }}
          placeholder="Input Markdown Syntax"
        />
        <br />
        <button type="submit" id="render-drawnix-btn">
          {"Render to Drawnix"}
        </button>
      </form>
    </>
  );
};

export default CustomTest;

import { useEffect } from "react";

interface CustomTestProps {
  onChange: (definition: string) => void;
}

const DEFAULT_MARKDOWN_VALUE = `# 《百年孤独》故事梗概

## 背景设定
- **地点**：虚构小镇**马孔多**（Macondo）
- **家族**：**布恩迪亚家族**七代人的兴衰史
- **风格**：魔幻现实主义，现实与奇幻交织

---

## 核心情节线

1. **建镇与开端**
   - 第一代**何塞·阿尔卡蒂奥·布恩迪亚**与妻子**乌尔苏拉**建立马孔多
   - 吉卜赛人带来新奇发明（磁铁、冰块等），预言书《羊皮卷》首次出现

2. **内战与香蕉公司**
   - 第二代**奥雷里亚诺·布恩迪亚上校**发动32场失败起义
   - 美国香蕉公司入驻带来繁荣与剥削，工人大屠杀后被抹去历史

3. **衰落与终结**
   - 持续四年十一个月暴雨加速小镇衰败
   - 第六代**奥雷里亚诺**与姨妈**阿玛兰妲·乌尔苏拉**乱伦生子
   - 最后一代（长猪尾巴婴儿）被蚂蚁吞噬，马孔多被飓风抹去

---

## 关键人物命运

- **乌尔苏拉**：家族支柱，见证百年兴衰，最终失明衰老
- **丽贝卡**：吃土癖，丈夫死后自我封闭至死
- **美人儿蕾梅黛丝**：乘床单升天消失
- **奥雷里亚诺上校**：晚年制作小金鱼再熔化循环
- **阿玛兰妲**：终生未嫁，织寿衣至死

---

## 核心主题
- **孤独循环**：家族成员重复姓名与命运，陷入无法逃脱的宿命
- **记忆与遗忘**：香蕉屠杀被官方否认，历史被篡改
- **时间困境**：过去/现在/未来交织，马孔多最终"从世人记忆中根除"
- **预言应验**：羊皮卷密码揭示"家族第一人被绑在树上，最后一人被蚂蚁吃掉"

> "家族的第一个人被捆在树上，最后一个人正被蚂蚁吃掉。" ——《羊皮卷》最终预言`;

const CustomTest = ({ onChange }: CustomTestProps) => {
  useEffect(() => {
    onChange(DEFAULT_MARKDOWN_VALUE);
  }, []);

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          onChange(formData.get("markdown-input")?.toString() || "");
        }}
      >
        <textarea
          id="markdown-input"
          rows={10}
          cols={50}
          name="markdown-input"
          onChange={(e) => {
            onChange(e.target.value);
          }}
          style={{ marginTop: "1rem" }}
          placeholder="Input Markdown Syntax"
          defaultValue={DEFAULT_MARKDOWN_VALUE}
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

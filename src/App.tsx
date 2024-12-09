import { FC } from "react";
import { setTranslations } from "polotno/config";

import fr from "@/translations/fr.json";
import en from "@/translations/en.json";
import id from "@/translations/id.json";
import ru from "@/translations/ru.json";
import ptBr from "@/translations/pt-br.json";
import zhCh from "@/translations/zh-ch.json";
import React from "react";
import { useProject } from "@/utils/project";

// load default translations
setTranslations(en);

const App: FC = () => {
  const project = useProject();

  React.useEffect(() => {
    if (project.language.startsWith("fr")) {
      setTranslations(fr, { validate: true });
    } else if (project.language.startsWith("id")) {
      setTranslations(id, { validate: true });
    } else if (project.language.startsWith("ru")) {
      setTranslations(ru, { validate: true });
    } else if (project.language.startsWith("pt")) {
      setTranslations(ptBr, { validate: true });
    } else if (project.language.startsWith("zh")) {
      setTranslations(zhCh, { validate: true });
    } else {
      setTranslations(en, { validate: true });
    }
  }, [project.language]);

  return <div>This is a div</div>;
};

export default App;

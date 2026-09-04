import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useEditor } from '@/frontend/hooks/use-editor';
import { DYNAMIC_COMPONENT_FIELDS } from '@/frontend/lib/dynamic-component-registry';

const DynamicWrapperSettings = () => {
   const { editor, dispatch } = useEditor();

   const selected = editor.editor.selectedElement;
   const currentContent =
      typeof selected.content === 'object' && !Array.isArray(selected.content)
         ? selected.content
         : {};
   const componentRef =
      'componentRef' in currentContent
         ? (currentContent.componentRef as string)
         : undefined;
   const api =
      'api' in currentContent ? (currentContent.api as string) : undefined;
   const fields = (currentContent.fields ?? {}) as Record<string, string>;

   const fieldDefs = componentRef
      ? (DYNAMIC_COMPONENT_FIELDS[componentRef] ?? [])
      : [];

   const updateField = (key: string, value: string) => {
      dispatch({
         type: 'UPDATE_ELEMENT',
         payload: {
            elementDetails: {
               ...selected,
               content: {
                  ...currentContent,
                  fields: {
                     ...fields,
                     [key]: value,
                  },
               },
            },
         },
      });
   };

   return (
      selected.type === 'dynamicWrapper' && (
         <div className="flex flex-col gap-4">
                {api && (
                    <p className="text-xs text-muted-foreground">
                        Komponen ini mengambil data dari API: {api}
                    </p>
                )}

            {!componentRef && !api && (
               <p className="text-xs text-muted-foreground">
                  Belum ada komponen yang dipilih untuk wrapper ini.
               </p>
            )}

            {!api &&
               fieldDefs.map((def) => (
                  <div key={def.key} className="flex flex-col gap-2">
                     <Label>{def.label}</Label>
                     {def.type === 'textarea' ? (
                        <Textarea
                           rows={3}
                           value={fields[def.key] ?? ''}
                           placeholder={def.placeholder ?? def.label}
                           onChange={(e) =>
                              updateField(def.key, e.target.value)
                           }
                        />
                     ) : (
                        <Input
                           value={fields[def.key] ?? ''}
                           placeholder={def.placeholder ?? def.label}
                           onChange={(e) =>
                              updateField(def.key, e.target.value)
                           }
                        />
                     )}
                  </div>
               ))}
         </div>
      )
   );
};

export default DynamicWrapperSettings;

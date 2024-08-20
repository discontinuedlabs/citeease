import { EmptyPage, List } from "../../components/ui/MaterialComponents";
import { useAuth } from "../../context/AuthContext";
import { useDialog } from "../../context/DialogContext.tsx";
import { updateBibField } from "../../data/store/slices/bibsSlice";
import { useEnhancedDispatch, useFindBib } from "../../hooks/hooks.tsx";

export function CollaboratorsManager({ setIsVisible }) {
    const bibliography = useFindBib();
    const { currentUser } = useAuth();
    const dialog = useDialog();
    const dispatch = useEnhancedDispatch();

    function handleDeleteCollaborator(collaborator) {
        dialog.show({
            headline: "Delete collaborator",
            content: `Are you sure you want to delete \`${collaborator.name}\` from this collaborative bibliography?`,
            actions: [
                ["Cancel", () => dialog.close()],
                [
                    "Delete",
                    () =>
                        dispatch(
                            updateBibField({
                                bibliographyId: bibliography.id,
                                key: "collab",
                                value: {
                                    ...bibliography.collab,
                                    collaborators: bibliography.collab.collaborators.filter(
                                        (co) => co.id !== collaborator.id
                                    ),
                                },
                            })
                        ),
                ],
            ],
        });
    }

    async function handleShare() {
        try {
            if (navigator.share) {
                const text = `Let's work together on this bibliography!\n\nClick the link below to join the collaboration:\nhttps://discontinuedlabs.github.io/citeease/#/?q=${bibliography?.collab?.id}\n\nPassword: ${bibliography.collab.password}`;

                await navigator.share({
                    title: bibliography?.title,
                    text,
                });
            } else {
                console.log("Web Share API is not supported.");
            }
        } catch (error) {
            console.error("Error sharing:", error);
        }
    }

    return (
        <div>
            <button type="button" onClick={() => setIsVisible(false)}>
                X
            </button>
            <h3>Manage collaborators</h3>
            {(bibliography?.collab?.collaborators?.length === 1 && (
                <EmptyPage
                    icon="group_off"
                    title="No collaborators"
                    message="You don't have any collaborators in this bibliography"
                    actions={[["Share bibliography", handleShare]]}
                />
            )) || (
                <List
                    items={bibliography?.collab?.collaborators
                        ?.filter((co) => co.id !== currentUser.uid)
                        .map((co) => ({
                            title: co.name,
                            onClick: () => handleDeleteCollaborator(co),
                        }))}
                />
            )}
        </div>
    );
}

export function a() {}

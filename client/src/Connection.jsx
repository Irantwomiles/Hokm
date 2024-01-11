import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";

function Connection({setPlayerName, handleConnect, handleCreateGame, handleUpdateLobbies}) {
    return (
        <>
            <Form className={"connect-form"}>
                <Form.Group className="mt-2">
                    <Form.Label>Username</Form.Label>
                    <InputGroup className="mb-3">
                        <Form.Control type="text" placeholder="Type username..." onChange={(e) => setPlayerName(e.target.value)} />
                        <Button variant={"one"}
                                onClick={handleConnect}
                        >
                            Connect
                        </Button>
                    </InputGroup>
                </Form.Group>
            </Form>

            <button onClick={handleCreateGame}>Create Game</button>
            <button onClick={handleUpdateLobbies}>Update Lobbies</button>
        </>
    )
}

export default Connection;